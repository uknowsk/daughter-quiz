import { getStudent, parentKeys } from "../../lib/users";
import { getOrCreateDailySet } from "../../lib/daily";
import {
  getValidAccessToken,
  saveProgress,
  saveResult,
  addWrongNotes,
  removeWrongNoteByKey,
} from "../../lib/store";
import { nextLevel } from "../../lib/difficulty";
import { sendToMe } from "../../lib/kakao";

function normalize(str) {
  return String(str || "").trim().replace(/\s+/g, "").toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원해요" });
    return;
  }

  const { userId, subject, answers, questionIds } = req.body;
  const student = getStudent(userId);
  if (!student) {
    res.status(400).json({ error: "알 수 없는 사용자예요" });
    return;
  }

  // 오늘 학생에게 나갔던 바로 그 세트로 채점 (캐시 사용)
  const set = await getOrCreateDailySet(student, subject);
  const level = set.level;
  const pool = set.questions || [];
  const questions =
    Array.isArray(questionIds) && questionIds.length
      ? questionIds.map((id) => pool.find((q) => String(q.id) === String(id))).filter(Boolean)
      : pool;

  let correctCount = 0;
  const detail = questions.map((q) => {
    const given = answers?.[q.id];
    const isCorrect = normalize(given) === normalize(q.answer);
    if (isCorrect) correctCount += 1;
    return { id: q.id, q: q.q, given, answer: q.answer, image: q.image || null, explain: q.explain || null, isCorrect };
  });

  const total = questions.length;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const newLevel = nextLevel(level, percent);

  await saveProgress(userId, subject, newLevel);
  await saveResult(userId, subject, { correctCount, total, percent, level, nextLevel: newLevel, detail });

  const wrongItems = detail.filter((d) => !d.isCorrect);
  await addWrongNotes(userId, subject, level, wrongItems, set.concept?.title || null);
  for (const d of detail.filter((d) => d.isCorrect)) {
    await removeWrongNoteByKey(userId, `${subject}|${level}|${d.q}`);
  }

  let kakaoSent = true;
  const baseUrl = process.env.KAKAO_REDIRECT_URI.replace("/api/auth/kakao/callback", "");
  const message = {
    title: `[${student.name} · ${subject}] 학습 결과`,
    description: `${correctCount} / ${total} 정답 (${percent}%)\n다음 난이도: ${newLevel}${
      wrongItems.length ? `\n오답 ${wrongItems.length}개는 오답노트에 저장했어요.` : ""
    }`,
    linkUrl: `${baseUrl}/result?user=${encodeURIComponent(userId)}&subject=${encodeURIComponent(subject)}`,
    buttonText: "결과·오답 확인",
  };

  for (const who of [userId, ...parentKeys(userId)]) {
    const token = await getValidAccessToken(who);
    if (!token) continue;
    try {
      await sendToMe(token, message);
    } catch (e) {
      console.error(`카카오톡 발송 실패 (${who}):`, e.message);
      kakaoSent = false;
    }
  }

  res.status(200).json({ correctCount, total, percent, nextLevel: newLevel, kakaoSent, detail });
}
