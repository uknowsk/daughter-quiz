// 저장소: 로컬에서는 data/*.json 파일, 배포(Vercel)에서는 Upstash Redis를 사용합니다.
// Upstash 환경변수 이름은 연동 방식/Prefix에 따라 달라질 수 있어서, 이름에 의존하지 않고
// 환경변수 전체에서 Redis REST URL/TOKEN을 자동으로 찾아냅니다.
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { refreshAccessToken } from "./kakao";

function detectRedisCreds() {
  const env = process.env;

  // 1) REST API용 https URL 찾기 (…REST_API_URL 로 끝나거나, upstash.io 를 가리키는 https 값)
  let url = null;
  for (const [k, v] of Object.entries(env)) {
    if (!v) continue;
    if (/REST_API_URL$/.test(k) && v.startsWith("https://")) { url = v; break; }
  }
  if (!url) {
    for (const [k, v] of Object.entries(env)) {
      if (!v) continue;
      if (/URL$/.test(k) && v.startsWith("https://") && v.includes("upstash.io")) { url = v; break; }
    }
  }

  // 2) 쓰기 가능한 토큰 찾기 (…REST_API_TOKEN 으로 끝나되 READ_ONLY 는 제외)
  let token = null;
  for (const [k, v] of Object.entries(env)) {
    if (!v) continue;
    if (/REST_API_TOKEN$/.test(k) && !/READ_ONLY/.test(k)) { token = v; break; }
  }
  if (!token) {
    for (const [k, v] of Object.entries(env)) {
      if (!v) continue;
      if (/TOKEN$/.test(k) && !/READ_ONLY/.test(k) && /UPSTASH|KV|REDIS/.test(k)) { token = v; break; }
    }
  }

  return url && token ? { url, token } : null;
}

const creds = detectRedisCreds();
const useRedis = Boolean(creds);
const redis = useRedis ? new Redis(creds) : null;

const DATA_DIR = path.join(process.cwd(), "data");

function fileFor(key) {
  return path.join(DATA_DIR, `${key}.json`);
}

async function read(key, fallback) {
  if (useRedis) {
    const value = await redis.get(key);
    return value ?? fallback;
  }
  try {
    const file = fileFor(key);
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

async function write(key, data) {
  if (useRedis) {
    await redis.set(key, data);
    return;
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(fileFor(key), JSON.stringify(data, null, 2), "utf-8");
}

// ---- 카카오 토큰 (role: "daughter" | "parent") ----
export async function getTokens() {
  return read("tokens", {});
}

export async function saveToken(role, tokenData) {
  const tokens = await getTokens();
  tokens[role] = { ...tokens[role], ...tokenData, savedAt: Date.now() };
  await write("tokens", tokens);
}

// 유효한 access_token 반환. 만료가 가까우면 refresh_token으로 갱신 후 저장.
// 발송 직전에 항상 호출하면 "토큰 만료로 발송 실패"를 예방할 수 있어요.
export async function getValidAccessToken(role) {
  const tokens = await getTokens();
  const t = tokens[role];
  if (!t) return null;

  const ageMs = Date.now() - (t.savedAt || 0);
  const expiresMs = (t.expires_in || 21600) * 1000; // 기본 6시간
  const stillFresh = ageMs < expiresMs - 5 * 60 * 1000; // 만료 5분 전까지는 재사용
  if (stillFresh && t.access_token) return t.access_token;

  if (!t.refresh_token) return t.access_token || null;

  try {
    const refreshed = await refreshAccessToken(t.refresh_token);
    // 카카오는 refresh_token을 매번 새로 주지는 않음 → 있을 때만 갱신
    await saveToken(role, {
      access_token: refreshed.access_token,
      expires_in: refreshed.expires_in,
      ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
    });
    return refreshed.access_token;
  } catch (e) {
    console.error(`[${role}] 토큰 갱신 실패:`, e.message);
    return t.access_token || null;
  }
}

// ---- 과목별 난이도 진행 상황 (사용자별) ----
const DEFAULT_PROGRESS = { 수학: { level: "중" }, 과학: { level: "중" }, 사회: { level: "중" } };

export async function getProgress(userId) {
  const all = await read("progress", {});
  return all[userId] || { ...DEFAULT_PROGRESS };
}

export async function saveProgress(userId, subject, level) {
  const all = await read("progress", {});
  const mine = all[userId] || { ...DEFAULT_PROGRESS };
  mine[subject] = { level };
  all[userId] = mine;
  await write("progress", all);
}

// ---- 채점 결과 상세 (사용자별·과목별 최근 1회분) ----
export async function getResult(userId, subject) {
  const all = await read("results", {});
  return all[userId]?.[subject] || null;
}

export async function saveResult(userId, subject, resultData) {
  const all = await read("results", {});
  all[userId] = all[userId] || {};
  all[userId][subject] = { ...resultData, submittedAt: Date.now() };
  await write("results", all);
}

// ---- 오답노트 (사용자별로 틀린 문제를 누적 저장) ----
export async function getWrongNotes(userId) {
  const all = await read("wrongnotes", {});
  return all[userId] || [];
}

// 이번 제출에서 틀린 문항들을 오답노트에 추가. 같은 문제는 최신 것으로 갱신.
export async function addWrongNotes(userId, subject, level, wrongItems) {
  const all = await read("wrongnotes", {});
  const list = all[userId] || [];
  for (const w of wrongItems) {
    const key = `${subject}|${level}|${w.q}`;
    const existingIdx = list.findIndex((x) => x.key === key);
    const entry = {
      key,
      subject,
      level,
      q: w.q,
      given: w.given || "",
      answer: w.answer,
      image: w.image || null,
      addedAt: Date.now(),
    };
    if (existingIdx >= 0) list[existingIdx] = entry;
    else list.push(entry);
  }
  all[userId] = list;
  await write("wrongnotes", all);
}

// 오답노트에서 특정 문제를 지움 (예: 다시 맞혔을 때)
export async function removeWrongNoteByKey(userId, key) {
  const all = await read("wrongnotes", {});
  all[userId] = (all[userId] || []).filter((x) => x.key !== key);
  await write("wrongnotes", all);
}
