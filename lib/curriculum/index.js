// 학년별 커리큘럼을 한곳에서 불러오는 진입점입니다.
import g5 from "./g5";
import g6 from "./g6";
import m1 from "./m1";
import m2 from "./m2";
import g5more from "./g5_more";
import g6more from "./g6_more";
import m1more from "./m1_more";
import english from "./english";

const GRADE_MAP = {
  초5: g5,
  초6: g6,
  중1: m1,
  중2: m2,
};

// 영어는 학년별로 english.js에서 가져옵니다.
const ENGLISH_MAP = english;

// 추가 문제 세트(있는 학년만). 기본 문제와 합쳐 문제은행을 키웁니다.
const MORE_MAP = {
  초5: g5more,
  초6: g6more,
  중1: m1more,
};

export const SUBJECT_LIST = ["수학", "과학", "사회", "영어"];
const LEVELS = ["하", "중", "상"];

// grade("초6"), subject("수학") -> { concept, levels } (기본 + 추가 문제 합침)
export function getSubjectData(grade, subject) {
  if (subject === "영어") {
    return ENGLISH_MAP[grade] || null;
  }
  const g = GRADE_MAP[grade];
  if (!g) return null;
  const base = g[subject];
  if (!base) return null;

  const more = MORE_MAP[grade]?.[subject];
  if (!more) return base;

  const levels = {};
  for (const lv of LEVELS) {
    levels[lv] = [...(base.levels[lv] || []), ...(more[lv] || [])];
  }
  return { concept: base.concept, levels };
}

// grade -> { 수학, 과학, 사회 } 전체
export function getGrade(grade) {
  return GRADE_MAP[grade] || null;
}

// 날짜 기반 시드 (같은 날엔 같은 문제, 날이 바뀌면 다른 문제)
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 문제 풀(pool)에서 오늘 날짜 기준으로 count개를 골라 반환.
// 문제가 count개보다 적으면 있는 만큼 반환.
export function pickDaily(pool, count, keyStr) {
  if (!Array.isArray(pool) || pool.length === 0) return [];
  const n = Math.min(count, pool.length);
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  const offset = seedFrom(`${today}|${keyStr}`) % pool.length;
  const picked = [];
  for (let i = 0; i < n; i++) picked.push(pool[(offset + i) % pool.length]);
  return picked;
}

// 특정 문제 id로 원본 문제를 찾음 (채점용)
export function findQuestion(grade, subject, level, id) {
  const data = getSubjectData(grade, subject);
  if (!data) return null;
  const pool = data.levels[level] || [];
  return pool.find((q) => String(q.id) === String(id)) || null;
}
