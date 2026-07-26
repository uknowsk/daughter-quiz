import { getValidAccessToken } from "../../../lib/store";
import { sendToMe } from "../../../lib/kakao";

// 매일 정해진 시간에 Vercel Cron이 이 주소를 호출합니다 (vercel.json 참고).
// 딸에게 "오늘의 학습" 링크를 카카오톡으로 발송해요.
export default async function handler(req, res) {
  // 보안: CRON_SECRET을 설정해두면, 그 값이 맞을 때만 실행합니다.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers["authorization"];
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
  }

  const baseUrl = process.env.KAKAO_REDIRECT_URI.replace("/api/auth/kakao/callback", "");

  try {
    const accessToken = await getValidAccessToken("daughter");
    if (!accessToken) {
      res.status(200).json({ ok: false, reason: "딸 계정이 아직 로그인되지 않았어요." });
      return;
    }

    const today = new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    await sendToMe(accessToken, {
      title: `📚 ${today} 오늘의 학습`,
      description: "사회·과학·수학 문제가 준비됐어요! 링크를 눌러서 풀어보자 💪",
      linkUrl: `${baseUrl}/`,
      buttonText: "오늘의 문제 풀러 가기",
    });

    res.status(200).json({ ok: true, sentAt: new Date().toISOString() });
  } catch (err) {
    console.error("일일 발송 실패:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}
