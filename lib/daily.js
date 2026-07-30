// 그날의 문제 세트를 준비합니다.
// 우선순위: (1) 오늘 이미 생성된 캐시 → (2) AI 생성(ANTHROPIC_API_KEY 있을 때) → (3) 정적 문제은행 폴백
import { getSubjectData, pickDaily } from "./curriculum";
import { todaysUnit, SEMESTER } from "./units";
import { generateQuestions, hasApiKey } from "./generate";
import {
  getProgress,
  getDailySet,
  saveDailySet,
  getAskedHistory,
  addAskedHistory,
} from "./store";

// 콘텐츠 정책이 바뀌면(예: 1학기 범위 적용) 이 버전을 올려서 그날 캐시를 새로 생성하게 함
const CACHE_VER = "v2-1학기";

function kstDate() {
  const d = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  return `${d}#${CACHE_VER}`;
}

// 정적 문제은행에서 오늘의 10문제 (폴백)
function staticSet(grade, subject, level, userId) {
  const data = getSubjectData(grade, subject);
  const pool = (data && data.levels[level]) || [];
  return {
    source: "static",
    concept: data?.concept || { title: "오늘의 개념", body: "" },
    level,
    unit: null,
    questions: pickDaily(pool, 10, `${userId}|${subject}|${level}`),
  };
}

// 한 과목의 오늘 세트를 준비. force=false면 캐시 우선.
export async function getOrCreateDailySet(student, subject, { force = false } = {}) {
  const userId = student.id;
  const grade = student.grade;
  const dateStr = kstDate();

  if (!force) {
    const cached = await getDailySet(userId, subject, dateStr);
    if (cached) return cached;
  }

  const progress = await getProgress(userId);
  const level = progress[subject]?.level || "중";

  let set = null;
  if (hasApiKey()) {
    const unit = todaysUnit(grade, subject);
    const avoid = await getAskedHistory(userId, subject);
    const gen = await generateQuestions({ grade, subject, unit, level, avoid, semester: SEMESTER });
    if (gen) {
      set = {
        source: "ai",
        concept: gen.concept,
        level,
        unit,
        questions: gen.questions,
      };
      await addAskedHistory(userId, subject, gen.questions.map((q) => q.q));
    }
  }

  if (!set) set = staticSet(grade, subject, level, userId); // 폴백

  await saveDailySet(userId, subject, dateStr, set);
  return set;
}

// 채점용: 오늘 세트에서 id로 문제 찾기
export async function findTodaysQuestion(student, subject, id) {
  const dateStr = kstDate();
  const set = await getDailySet(student.id, subject, dateStr);
  if (!set) return null;
  return set.questions.find((q) => String(q.id) === String(id)) || null;
}
