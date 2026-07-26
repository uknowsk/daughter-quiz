import { getSubjectData } from "../../lib/curriculum";
import { getStudent } from "../../lib/users";
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

  const { userId, subject, level, answers } = req.body;
  const student = getStudent(userId);
  if (!student) {
    res.status(400).json({ error: "알 수 없는 사용자예요" });
    return;
  }

  const data = getSubjectData(student.grade, subject);
  if (!data) {
    res.status(400).json({ error: "알 수 없는 과목/학년이에요" });
    return;
  }

  const questions = data.levels[level] || [];
  let correctCount = 0;
  const detail = questions.map((q) => {
    const given = answers?.[q.id];
    const isCorrect = normalize(given) === normalize(q.answer);
    if (isCorrect) correctCount += 1;
    return { id: q.id, q: q.q, given, answer: q.answer, image: q.image || null, isCorrect };
  });

  const total = questions.length;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const newLevel = nextLevel(level, percent);

  await saveProgress(userId, subject, newLevel);
  await saveResult(userId, subject, { correctCount, total, percent, level, nextLevel: newLevel, detail });

  // 오답노트: 틀린 문제는 추가, 맞힌 문제는(이전에 틀렸다면) 제거
  const wrongItems = detail.filter((d) => !d.isCorrect);
  await addWrongNotes(userId, subject, level, wrongItems);
  for (const d of detail.filter((d) => d.isCorrect)) {
    await removeWrongNoteByKey(userId, `${subject}|${level}|${d.q}`);
  }

  // 카카오톡으로 결과 발송 (학생 본인 + 학부모)
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

  for (const who of [userId, `${userId}_parent`]) {
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
