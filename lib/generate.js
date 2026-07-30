// Anthropic API로 그날의 문제 10개를 생성합니다.
// 환경변수 ANTHROPIC_API_KEY 가 있어야 동작하고, 없으면 null을 반환(호출부에서 정적 문제은행으로 폴백).

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// 마지막 생성 실패 사유(사람이 읽을 수 있는 요약). cron 경고에 사용.
let lastError = null;
export function getLastGenError() {
  return lastError;
}
function classifyError(status, bodyText) {
  const t = (bodyText || "").toLowerCase();
  if (status === 400 && t.includes("credit balance")) return "크레딧 잔액 부족";
  if (status === 401 || status === 403) return "API 키 인증 오류";
  if (status === 429) return "요청 한도 초과(잠시 후 재시도 필요)";
  return `API 오류 (status ${status})`;
}

function buildPrompt({ grade, subject, unit, level, avoid, semester }) {
  const levelDesc = { 하: "쉬움(기초)", 중: "보통(표준)", 상: "어려움(심화)" }[level] || "보통";
  const avoidText =
    avoid && avoid.length
      ? `\n\n[중복 금지] 아래와 비슷한 문제는 절대 만들지 마세요:\n- ${avoid.slice(0, 40).join("\n- ")}`
      : "";
  const sem = semester || "1학기";

  return `당신은 대한민국 ${grade} ${subject} 교육과정에 정통한 문제 출제 전문가입니다.
아래 조건으로 문제 10개를 만들어 주세요.

- 학년: ${grade}
- 학기: ${sem} (매우 중요)
- 과목: ${subject}
- 단원: ${unit}
- 난이도: ${level} (${levelDesc})
- ⚠️ 반드시 ${grade} ${sem}까지 배우는 교육과정 범위 안에서만 출제하세요. 아직 배우지 않은 ${sem} 이후(2학기 등)의 개념·용어·풀이법은 절대 사용하지 마세요.
- 초등/중등 눈높이에 맞는 명확하고 정확한 문제
- 객관식(mcq)과 단답형(short)을 섞어서 (mcq는 보기 4개, 정답 1개 포함)
- 수학은 반드시 스스로 검산하여 정답을 정확히 적을 것
- 각 문제에 한 줄 풀이 해설(explain)을 붙일 것
- 정답(answer)은 채점하기 쉽게 간결하게 (예: "3/2", "2", "삼권분립")${avoidText}

반드시 아래 JSON 형식으로만 출력하세요. 코드블록이나 다른 설명 없이 JSON만:
{
  "concept": { "title": "개념: (단원 핵심)", "body": "2~3문장으로 핵심 개념 설명" },
  "questions": [
    { "id": 1, "type": "mcq", "q": "문제", "choices": ["보기1","보기2","보기3","보기4"], "answer": "정답", "explain": "풀이" },
    { "id": 2, "type": "short", "q": "문제", "answer": "정답", "explain": "풀이" }
  ]
}
questions는 정확히 10개여야 합니다.`;
}

function extractJson(text) {
  // 코드블록/앞뒤 잡텍스트가 있어도 첫 { 부터 마지막 } 까지 파싱
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON을 찾을 수 없음");
  return JSON.parse(text.slice(start, end + 1));
}

function validate(data) {
  if (!data || !Array.isArray(data.questions)) throw new Error("questions 없음");
  const qs = data.questions
    .filter((q) => q && q.q && (q.answer !== undefined && q.answer !== null))
    .map((q, i) => ({
      id: i + 1,
      type: q.type === "mcq" ? "mcq" : "short",
      q: String(q.q),
      choices: q.type === "mcq" && Array.isArray(q.choices) ? q.choices.map(String) : undefined,
      answer: String(q.answer),
      explain: q.explain ? String(q.explain) : null,
    }))
    .filter((q) => (q.type === "mcq" ? q.choices && q.choices.includes(q.answer) : true));

  if (qs.length < 5) throw new Error(`유효 문항 부족(${qs.length}개)`);
  return {
    concept: {
      title: data.concept?.title || "오늘의 개념",
      body: data.concept?.body || "",
    },
    questions: qs.slice(0, 10),
  };
}

// 성공 시 { concept, questions } 반환, 실패/키없음 시 null
export async function generateQuestions({ grade, subject, unit, level, avoid, semester }) {
  if (!hasApiKey()) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        messages: [{ role: "user", content: buildPrompt({ grade, subject, unit, level, avoid, semester }) }],
      }),
    });

    if (!res.ok) {
      const bodyText = await res.text();
      lastError = classifyError(res.status, bodyText);
      console.error("문제 생성 API 오류:", res.status, bodyText);
      return null;
    }
    const json = await res.json();
    const text = json?.content?.[0]?.text || "";
    const result = validate(extractJson(text));
    lastError = null; // 성공
    return result;
  } catch (e) {
    lastError = `생성 처리 오류: ${e.message}`;
    console.error("문제 생성 실패:", e.message);
    return null;
  }
}
