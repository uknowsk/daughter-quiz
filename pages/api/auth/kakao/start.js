import { getKakaoLoginUrl } from "../../../../lib/kakao";

// /api/auth/kakao/start?role=daughter  또는 ?role=parent 로 접속하면
// 카카오 로그인 화면으로 이동시켜줍니다.
export default function handler(req, res) {
  const role = req.query.role === "parent" ? "parent" : "daughter";
  const loginUrl = getKakaoLoginUrl(role); // state 값으로 role을 실어 보냄
  res.redirect(loginUrl);
}
