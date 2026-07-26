import { exchangeCodeForToken, sendToMe } from "../../../../lib/kakao";
import { saveToken } from "../../../../lib/store";

export default async function handler(req, res) {
  const { code, state } = req.query; // state = "daughter" 또는 "parent"
  const role = state === "parent" ? "parent" : "daughter";

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!code) {
    res.status(400).send("로그인 코드가 없습니다. 다시 시도해주세요.");
    return;
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    await saveToken(role, tokenData);

    console.log(`[${role}] 토큰 발급 성공. scope:`, tokenData.scope);

    // 등록 확인용으로 본인 카톡에 테스트 메시지 발송
    const sendResult = await sendToMe(tokenData.access_token, {
      title: "등록 완료 🎉",
      description:
        role === "daughter"
          ? "딸 계정으로 등록됐어요! 매일 아침 오늘의 문제 링크가 여기로 올 거예요."
          : "부모님 계정으로 등록됐어요! 매일 채점 결과가 여기로 올 거예요.",
      linkUrl: `${process.env.KAKAO_REDIRECT_URI.replace("/api/auth/kakao/callback", "")}/`,
      buttonText: "확인",
    });
    console.log(`[${role}] 카카오톡 발송 API 응답:`, JSON.stringify(sendResult));

    res.send(
      `<h2>${role === "daughter" ? "딸" : "부모님"} 계정 등록 완료!</h2><p>카카오톡을 확인해보세요. 이 창은 닫으셔도 됩니다.</p>`
    );
  } catch (err) {
    res.status(500).send(`등록 중 오류가 발생했어요: ${err.message}`);
  }
}
