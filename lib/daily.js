// 그날의 문제 세트를 준비합니다.
// 우선순위: (1) 오늘 이미 생성된 캐시 → (2) 미리 만들어둔 문제은행(g6-bank.json, 크레딧 안 씀)
//          → (3) AI 실시간 생성(은행에 없는 "하" 난이도 등, ANTHROPIC_API_KEY 있을 때) → (4) 정적 문제은행 폴백
import { getSubjectData, pickDaily } from "./curriculum";
import { getBankSet } from "./curriculum/bank";
import { todaysUnit, SEMESTER } from "./units";
import { generateQuestions, hasApiKey } from "./generate";
import {
  getProgress,
  getDailySet,
  saveDailySet,
  getAskedHistory,
  addAskedHistory,
} from "./store";

// 콘텐츠 정책이 바뀌면(예: 1학기 범위 적용, 문제은행 도입) 이 버전을 올려서 그날 캐시를 새로 생성하게 함
const CACHE_VER = "v3-은행";

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
  const unit = todaysUnit(grade, subject);

  let set = null;

  // 1) 미리 만들어둔 문제은행 우선 사용 (크레딧 거의 안 듦)
  const bankSet = getBankSet(grade, subject, unit, level);
  if (bankSet) {
    set = {
      source: "bank",
      concept: bankSet.concept || { title: "오늘의 개념", body: "" },
      level,
      unit,
      questions: pickDaily(bankSet.questions, 10, `${userId}|${subject}|${level}|${unit}`),
    };
  }

  // 2) 은행에 없으면(예: "하" 난이도, 아직 못 만든 단원 등) 그때만 AI 실시간 생성
  if (!set && hasApiKey()) {
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

  if (!set) set = staticSet(grade, subject, level, userId); // 최종 폴백

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
