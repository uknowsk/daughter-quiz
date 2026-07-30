// 미리 생성해둔 문제은행(lib/curriculum/g6-bank.json)을 읽어오는 모듈.
// scripts/generate-bank.mjs 로 만든 파일을 그대로 불러옵니다.
import bankData from "./g6-bank.json";

// grade/subject/unit/level 에 해당하는 은행 세트를 찾음.
// 없으면(예: "하" 난이도는 기본적으로 안 만들어둠) null 반환 → 호출부가 AI 실시간 생성으로 폴백.
export function getBankSet(grade, subject, unit, level) {
  if (!bankData || bankData.grade !== grade) return null;
  const subj = bankData.subjects?.[subject];
  if (!subj) return null;
  const questions = subj.banks?.[unit]?.[level];
  if (!Array.isArray(questions) || questions.length < 5) return null;
  const concept = subj.concepts?.[unit] || null;
  return { concept, questions };
}
