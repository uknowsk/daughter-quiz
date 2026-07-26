import { getKakaoLoginUrl } from "../../../../lib/kakao";

// /api/auth/kakao/start?who=<사용자아이디>  (학생은 id, 학부모는 id_parent)
export default function handler(req, res) {
  const who = (req.query.who || "").toString();
  if (!who) {
    res.status(400).send("who 파라미터가 필요해요.");
    return;
  }
  res.redirect(getKakaoLoginUrl(who)); // state로 who 전달
}
