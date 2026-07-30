import { getValidAccessToken } from "../../../lib/store";
import { sendToMe } from "../../../lib/kakao";
import { STUDENTS, parentKeys } from "../../../lib/users";
import { SUBJECT_LIST } from "../../../lib/curriculum";
import { getOrCreateDailySet } from "../../../lib/daily";
import { hasApiKey, liveFallbackEnabled, getLastGenError } from "../../../lib/generate";

// 첫 번째로 발송 가능한 학부모 토큰을 찾아 경고를 보냄 (관리자 = 로아빠)
async function warnAdmin(text) {
  for (const s of STUDENTS) {
    for (const pk of parentKeys(s.id)) {
      const token = await getValidAccessToken(pk);
      if (token) {
        try {
          await sendToMe(token, {
            title: "⚠️ 학습앱 알림",
            description: text,
            linkUrl: "https://console.anthropic.com/settings/billing",
            buttonText: "크레딧 확인하러 가기",
          });
          return true;
        } catch (_) {}
      }
    }
  }
  return false;
}

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

  let aiExpectedButFailed = false;
  const results = [];
  for (const s of STUDENTS) {
    // 발송 전에 오늘의 문제 미리 생성해 캐시 (링크 열 때 빠르게)
    for (const subject of SUBJECT_LIST) {
      try {
        const set = await getOrCreateDailySet(s, subject);
        // 실시간 AI 생성을 로아빠가 켜둔 상태(ALLOW_LIVE_AI_FALLBACK=true)인데도 정적 문제은행으로 떨어졌다면 = AI 생성 실패
        // (기본값인 "꺼짐" 상태에서 정적 폴백으로 가는 건 의도된 정상 동작이므로 경고하지 않음)
        if (liveFallbackEnabled() && hasApiKey() && set.source === "static") aiExpectedButFailed = true;
      } catch (e) {
        console.error(`세트 생성 실패 (${s.id}/${subject}):`, e.message);
      }
    }

    const token = await getValidAccessToken(s.id);
    if (!token) {
      results.push({ student: s.id, sent: false, reason: "미로그인" });
      continue;
    }
    try {
      await sendToMe(token, {
        title: `📚 ${today} 오늘의 학습`,
        description: `${s.name}(${s.grade}) 사회·과학·수학·영어 문제가 준비됐어요! 링크를 눌러 풀어보자 💪`,
        linkUrl: `${baseUrl}/?user=${encodeURIComponent(s.id)}`,
        buttonText: "오늘의 문제 풀러 가기",
      });
      results.push({ student: s.id, sent: true });
    } catch (e) {
      results.push({ student: s.id, sent: false, reason: e.message });
    }
  }

  // AI 생성이 실패했으면 관리자(로아빠)에게 경고 카톡
  let warned = false;
  if (aiExpectedButFailed) {
    const reason = getLastGenError() || "알 수 없는 이유";
    warned = await warnAdmin(
      `오늘 AI 문제 생성에 실패해 기존 문제은행으로 대체됐어요.\n사유: ${reason}\n→ Anthropic 크레딧/키를 확인해주세요.`
    );
  }

  res.status(200).json({ ok: true, sentAt: new Date().toISOString(), aiFailed: aiExpectedButFailed, warned, results });
}
