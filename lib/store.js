// 저장소: 로컬에서는 data/*.json 파일, 배포(Vercel)에서는 Upstash Redis를 사용합니다.
// Upstash 환경변수 이름은 연동 방식/Prefix에 따라 달라질 수 있어서, 이름에 의존하지 않고
// 환경변수 전체에서 Redis REST URL/TOKEN을 자동으로 찾아냅니다.
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

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
  tokens[role] = { ...tokenData, savedAt: Date.now() };
  await write("tokens", tokens);
}

// ---- 과목별 난이도 진행 상황 ----
export async function getProgress() {
  return read("progress", {
    수학: { level: "중" },
    과학: { level: "중" },
    사회: { level: "중" },
  });
}

export async function saveProgress(subject, level) {
  const progress = await getProgress();
  progress[subject] = { level };
  await write("progress", progress);
}

// ---- 채점 결과 상세 (과목별 최근 1회분) ----
export async function getResult(subject) {
  const results = await read("results", {});
  return results[subject] || null;
}

export async function saveResult(subject, resultData) {
  const results = await read("results", {});
  results[subject] = { ...resultData, submittedAt: Date.now() };
  await write("results", results);
}
