// 학년별 커리큘럼을 한곳에서 불러오는 진입점입니다.
import g5 from "./g5";
import g6 from "./g6";
import m1 from "./m1";
import m2 from "./m2";

const GRADE_MAP = {
  초5: g5,
  초6: g6,
  중1: m1,
  중2: m2,
};

export const SUBJECT_LIST = ["수학", "과학", "사회"];

// grade("초6"), subject("수학") -> { concept, levels }
export function getSubjectData(grade, subject) {
  const g = GRADE_MAP[grade];
  if (!g) return null;
  return g[subject] || null;
}

// grade -> { 수학, 과학, 사회 } 전체
export function getGrade(grade) {
  return GRADE_MAP[grade] || null;
}
