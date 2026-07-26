// 학생 목록 설정 파일.
// 여기에 학생을 추가/수정하면 로그인 페이지·자동발송·채점이 자동으로 반영돼요.
//
// - id: 영문/숫자로 된 고유값 (로그인·토큰 저장에 쓰이므로 겹치면 안 됨). 한 번 정하면 바꾸지 마세요.
// - name: 화면에 보이는 이름
// - grade: "초5" | "초6" | "중1" | "중2" 중 하나 (커리큘럼 학년)
//
// 학부모 알림은 각 학생마다 자동으로 "<id>_parent" 계정으로 연결돼요.
// (로그인 페이지에서 학생별로 "학부모 로그인" 버튼이 생겨요.)

export const STUDENTS = [
  { id: "daughter", name: "딸", grade: "초6" },
  { id: "hayul", name: "김하율", grade: "중1" },
  { id: "nayul", name: "김나율", grade: "초5" },
  // 예시) 아래처럼 줄을 추가하면 사용자가 늘어나요. id는 꼭 서로 다르게!
  // { id: "friend", name: "친구", grade: "중2" },
];

export function getStudent(id) {
  return STUDENTS.find((s) => s.id === id) || null;
}

export const GRADES = ["초5", "초6", "중1", "중2"];
