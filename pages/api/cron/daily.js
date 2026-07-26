import { getValidAccessToken } from "../../../lib/store";
import { sendToMe } from "../../../lib/kakao";
import { STUDENTS } from "../../../lib/users";

// 매일 정해진 시간에 Vercel Cron이 호출 → 등록된 모든 학생에게 오늘의 학습 링크 발송
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers["authorization"];
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
  }

  const baseUrl = process.env.KAKAO_REDIRECT_URI.replace("/api/auth/kakao/callback", "");
  const today = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short",
  });

  const results = [];
  for (const s of STUDENTS) {
    const token = await getValidAccessToken(s.id);
    if (!token) {
      results.push({ student: s.id, sent: false, reason: "미로그인" });
      continue;
    }
    try {
      await sendToMe(token, {
        title: `📚 ${today} 오늘의 학습`,
        description: `${s.name}(${s.grade}) 사회·과학·수학 문제가 준비됐어요! 링크를 눌러 풀어보자 💪`,
        linkUrl: `${baseUrl}/?user=${encodeURIComponent(s.id)}`,
        buttonText: "오늘의 문제 풀러 가기",
      });
      results.push({ student: s.id, sent: true });
    } catch (e) {
      results.push({ student: s.id, sent: false, reason: e.message });
    }
  }

  res.status(200).json({ ok: true, sentAt: new Date().toISOString(), results });
}
