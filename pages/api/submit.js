import math from "../../lib/curriculum/math";
import science from "../../lib/curriculum/science";
import social from "../../lib/curriculum/social";
import { getTokens, getProgress, saveProgress, saveResult } from "../../lib/store";
import { nextLevel } from "../../lib/difficulty";
import { sendToMe } from "../../lib/kakao";

const SUBJECTS = { 수학: math, 과학: science, 사회: social };

function normalize(str) {
  return String(str || "").trim().replace(/\s+/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원해요" });
    return;
  }

  const { subject, level, answers } = req.body;
  const data = SUBJECTS[subject];
  if (!data) {
    res.status(400).json({ error: "알 수 없는 과목이에요" });
    return;
  }

  const questions = data.levels[level] || [];
  let correctCount = 0;
  const detail = questions.map((q) => {
    const given = answers?.[q.id];
    const isCorrect = normalize(given) === normalize(q.answer);
    if (isCorrect) correctCount += 1;
    return { id: q.id, q: q.q, given, answer: q.answer, isCorrect };
  });

  const total = questions.length;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const newLevel = nextLevel(level, percent);
  await saveProgress(subject, newLevel);
  await saveResult(subject, { correctCount, total, percent, level, nextLevel: newLevel, detail });

  // 카카오톡으로 결과 발송 (딸 + 부모님, 로그인 안 되어 있으면 건너뜀)
  let kakaoSent = true;
  const tokens = await getTokens();
  const baseUrl = process.env.KAKAO_REDIRECT_URI.replace("/api/auth/kakao/callback", "");
  const message = {
    title: `[${subject}] 오늘 학습 결과`,
    description: `${correctCount} / ${total} 정답 (${percent}%)\n다음 난이도: ${newLevel}`,
    linkUrl: `${baseUrl}/result?subject=${encodeURIComponent(subject)}`,
    buttonText: "결과 자세히 보기",
  };

  for (const role of ["daughter", "parent"]) {
    const t = tokens[role];
    if (!t) continue;
    try {
      await sendToMe(t.access_token, message);
    } catch (e) {
      console.error(`카카오톡 발송 실패 (${role}):`, e.message);
      kakaoSent = false;
    }
  }

  res.status(200).json({ correctCount, total, percent, nextLevel: newLevel, kakaoSent, detail });
}
