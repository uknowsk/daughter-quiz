// 저장소: 로컬에서는 data/*.json 파일, 배포(Vercel)에서는 Upstash Redis를 사용합니다.
// Upstash 환경변수(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)가 있으면 자동으로 Redis를 씁니다.
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const useRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = useRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

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
