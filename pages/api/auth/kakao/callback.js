import { exchangeCodeForToken, sendToMe } from "../../../../lib/kakao";
import { saveToken } from "../../../../lib/store";
import { getStudent } from "../../../../lib/users";

export default async function handler(req, res) {
  const { code, state } = req.query; // state = who (예: "daughter" 또는 "daughter_parent")
  const who = (state || "").toString();

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!code || !who) {
    res.status(400).send("로그인 정보가 없습니다. 다시 시도해주세요.");
    return;
  }

  const isParent = who.endsWith("_parent");
  const studentId = isParent ? who.replace(/_parent$/, "") : who;
  const student = getStudent(studentId);
  const label = student ? `${student.name}${isParent ? " 학부모" : ""}` : who;

  try {
    const tokenData = await exchangeCodeForToken(code);
    await saveToken(who, tokenData);
    console.log(`[${who}] 토큰 발급 성공. scope:`, tokenData.scope);

    const sendResult = await sendToMe(tokenData.access_token, {
      title: "등록 완료 🎉",
      description: isParent
        ? `${label} 계정으로 등록됐어요! 자녀의 학습 결과가 여기로 올 거예요.`
        : `${label} 계정으로 등록됐어요! 매일 아침 오늘의 문제 링크가 여기로 올 거예요.`,
      linkUrl: `${process.env.KAKAO_REDIRECT_URI.replace("/api/auth/kakao/callback", "")}/${
        isParent ? "" : `?user=${encodeURIComponent(studentId)}`
      }`,
      buttonText: "확인",
    });
    console.log(`[${who}] 카카오톡 발송 응답:`, JSON.stringify(sendResult));

    res.send(`<h2>${label} 계정 등록 완료!</h2><p>카카오톡을 확인해보세요. 이 창은 닫으셔도 됩니다.</p>`);
  } catch (err) {
    res.status(500).send(`등록 중 오류가 발생했어요: ${err.message}`);
  }
}
