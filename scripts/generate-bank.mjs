// 초6 문제은행 대량 생성 스크립트 (1회성 실행용)
// 목적: 매일 AI를 실시간 호출하는 대신, 단원별로 문제를 미리 넉넉히 만들어
//       lib/curriculum/g6-bank.json 에 저장해둠 → 이후엔 이 파일에서 꺼내 쓰므로
//       매일 크레딧이 거의 들지 않음.
//
// 실행: ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-bank.mjs
//
// 주의: 이 파일은 lib/units.js 의 "초6" 단원 목록을 그대로 복사해 씁니다.
//      나중에 units.js에서 초6 단원을 바꾸면 아래 UNITS_G6 도 같이 바꿔주세요.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "lib", "curriculum", "g6-bank.json");

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY 환경변수가 없습니다.");
  process.exit(1);
}
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

const GRADE = "초6";
const SEMESTER = "1학기";
// "하" 난이도는 미리 만들지 않음 (대부분 안 쓰임) → 오답이 많아져서 실제로
// "하"로 내려갈 때만 그 순간에 AI가 즉석 생성. lib/daily.js 가 그 로직을 처리함.
const LEVELS = ["중", "상"];
const BATCHES_PER_LEVEL = 2; // 10문제 x 2배치 = 최대 20문제/단원/난이도

const UNITS_G6 = {
  수학: ["분수의 나눗셈", "각기둥과 각뿔", "소수의 나눗셈", "비와 비율", "여러 가지 그래프", "직육면체의 부피와 겉넓이"],
  과학: ["지구와 달의 운동", "여러 가지 기체", "식물의 구조와 기능", "빛과 렌즈"],
  사회: ["우리나라의 민주주의", "삼권분립과 국가기관", "시민의 정치 참여", "가계와 기업의 경제활동", "우리나라의 경제 성장", "무역과 경제 교류"],
  영어: ["일반동사 3인칭 단수", "현재진행형", "과거시제(규칙동사)", "조동사 can", "비교급", "의문사 의문문", "미래표현 be going to"],
};

let totalCalls = 0;
let totalOutputTokensApprox = 0;

async function callClaude(prompt, maxTokens) {
  totalCalls++;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const bodyText = await res.text();
    const err = new Error(`API 오류 status=${res.status} body=${bodyText.slice(0, 300)}`);
    err.status = res.status;
    err.bodyText = bodyText;
    throw err;
  }
  const json = await res.json();
  const text = json?.content?.[0]?.text || "";
  totalOutputTokensApprox += json?.usage?.output_tokens || 0;
  return text;
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON을 찾을 수 없음: " + text.slice(0, 200));
  return JSON.parse(text.slice(start, end + 1));
}

function buildConceptPrompt(subject, unit) {
  return `당신은 대한민국 ${GRADE} ${subject} 교육과정에 정통한 선생님입니다.
학생이 '${unit}' 단원을 학교에서 아직 배우지 않았더라도, 이 설명 하나만 읽으면 핵심 개념을 확실히 이해할 수 있도록
아주 친절하고 상세한 개념 설명을 작성해주세요.

조건:
- 학기: ${SEMESTER} 범위 안에서만 (그 이후 배우는 내용·용어는 쓰지 말 것)
- 분량: 600~1000자 정도, 문단 2~4개로 나눌 것
- 어려운 용어가 나오면 반드시 쉬운 말로 풀어서 설명할 것
- 실생활 예시를 최소 1개 포함
- 필요하면 순서를 매겨 단계별로 설명
- 문장은 초등학생이 읽기 쉽게 짧고 명확하게
- 맨 마지막 줄에 "핵심 한 줄 요약:"으로 시작하는 한 줄 요약 포함

반드시 아래 JSON 형식으로만 출력하세요. 코드블록이나 다른 설명 없이 JSON만:
{"title": "개념: (단원 핵심을 담은 제목)", "body": "전체 설명 (문단 구분은 \\n\\n 사용)"}`;
}

function buildQuestionPrompt(subject, unit, level, avoid) {
  const levelDesc = { 하: "쉬움(기초)", 중: "보통(표준)", 상: "어려움(심화)" }[level] || "보통";
  const avoidText =
    avoid && avoid.length
      ? `\n\n[중복 금지] 아래와 비슷한 문제는 절대 만들지 마세요:\n- ${avoid.slice(0, 30).join("\n- ")}`
      : "";
  return `당신은 대한민국 ${GRADE} ${subject} 교육과정에 정통한 문제 출제 전문가입니다.
아래 조건으로 문제 10개를 만들어 주세요.

- 학년: ${GRADE}
- 학기: ${SEMESTER} (매우 중요, 이후 학기 내용 절대 금지)
- 과목: ${subject}
- 단원: ${unit}
- 난이도: ${level} (${levelDesc})
- 초등학생 눈높이에 맞는 명확하고 정확한 문제
- 객관식(mcq)과 단답형(short)을 섞어서 (mcq는 보기 4개, 정답 1개 포함)
- 수학은 반드시 스스로 검산하여 정답을 정확히 적을 것
- 각 문제에 한 줄 풀이 해설(explain)을 붙일 것
- 정답(answer)은 채점하기 쉽게 간결하게${avoidText}

반드시 아래 JSON 형식으로만 출력하세요. 코드블록이나 다른 설명 없이 JSON만:
{"questions": [
  { "type": "mcq", "q": "문제", "choices": ["보기1","보기2","보기3","보기4"], "answer": "정답", "explain": "풀이" },
  { "type": "short", "q": "문제", "answer": "정답", "explain": "풀이" }
]}
questions는 정확히 10개여야 합니다.`;
}

function validateQuestions(data) {
  if (!data || !Array.isArray(data.questions)) return [];
  return data.questions
    .filter((q) => q && q.q && q.answer !== undefined && q.answer !== null)
    .map((q) => ({
      type: q.type === "mcq" ? "mcq" : "short",
      q: String(q.q),
      choices: q.type === "mcq" && Array.isArray(q.choices) ? q.choices.map(String) : undefined,
      answer: String(q.answer),
      explain: q.explain ? String(q.explain) : null,
    }))
    .filter((q) => (q.type === "mcq" ? q.choices && q.choices.includes(q.answer) : true));
}

function loadExisting() {
  if (fs.existsSync(OUT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

function save(bank) {
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(bank, null, 2), "utf8");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const bank = loadExisting();
  bank.grade = GRADE;
  bank.semester = SEMESTER;
  bank.generatedAt = bank.generatedAt || new Date().toISOString();
  bank.subjects = bank.subjects || {};

  let creditStop = false;

  for (const subject of Object.keys(UNITS_G6)) {
    if (creditStop) break;
    bank.subjects[subject] = bank.subjects[subject] || { concepts: {}, banks: {} };
    const subj = bank.subjects[subject];

    for (const unit of UNITS_G6[subject]) {
      if (creditStop) break;
      console.log(`\n=== ${subject} / ${unit} ===`);

      // 1) 개념 설명 (이미 있으면 건너뜀)
      if (!subj.concepts[unit]) {
        try {
          console.log("  개념 설명 생성 중...");
          const text = await callClaude(buildConceptPrompt(subject, unit), 1500);
          const data = extractJson(text);
          subj.concepts[unit] = {
            title: data.title || `개념: ${unit}`,
            body: data.body || "",
          };
          save(bank);
          console.log("  ✓ 개념 설명 저장");
        } catch (e) {
          console.error("  ✗ 개념 생성 실패:", e.message);
          if (e.status === 400 && /credit balance/i.test(e.bodyText || "")) creditStop = true;
        }
        await sleep(400);
      } else {
        console.log("  개념 설명 이미 있음, 건너뜀");
      }
      if (creditStop) break;

      // 2) 난이도별 문제 뭉치
      subj.banks[unit] = subj.banks[unit] || {};
      for (const level of LEVELS) {
        if (creditStop) break;
        const existing = subj.banks[unit][level] || [];
        if (existing.length >= 15) {
          console.log(`  [${level}] 이미 ${existing.length}개 있음, 건너뜀`);
          continue;
        }
        const collected = [...existing];
        const avoidTexts = collected.map((q) => q.q);

        for (let b = 0; b < BATCHES_PER_LEVEL; b++) {
          if (collected.length >= 20) break;
          try {
            console.log(`  [${level}] 문제 생성 중... (배치 ${b + 1}/${BATCHES_PER_LEVEL})`);
            const text = await callClaude(buildQuestionPrompt(subject, unit, level, avoidTexts), 3000);
            const qs = validateQuestions(extractJson(text));
            for (const q of qs) {
              if (!collected.some((c) => c.q === q.q)) {
                collected.push(q);
                avoidTexts.push(q.q);
              }
            }
            console.log(`    -> 누적 ${collected.length}개`);
          } catch (e) {
            console.error(`  ✗ [${level}] 배치 ${b + 1} 실패:`, e.message);
            if (e.status === 400 && /credit balance/i.test(e.bodyText || "")) {
              creditStop = true;
              break;
            }
          }
          await sleep(400);
        }

        subj.banks[unit][level] = collected.map((q, i) => ({ id: i + 1, ...q }));
        save(bank);
        console.log(`  ✓ [${level}] 총 ${collected.length}개 저장`);
      }
    }
  }

  console.log(`\n총 API 호출: ${totalCalls}회, 대략 출력 토큰: ${totalOutputTokensApprox}`);
  if (creditStop) {
    console.log("⚠️ 크레딧 부족으로 중간에 중단됨. 지금까지 만든 내용은 저장되어 있음.");
    process.exit(2);
  }
  console.log("✅ 전체 완료!");
}

main().catch((e) => {
  console.error("스크립트 오류:", e);
  process.exit(1);
});
