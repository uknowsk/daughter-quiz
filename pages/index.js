import { useState } from "react";
import { SUBJECT_LIST } from "../lib/curriculum";
import { getStudent, STUDENTS } from "../lib/users";
import { getOrCreateDailySet } from "../lib/daily";

export async function getServerSideProps({ query }) {
  const userId = query.user || (STUDENTS[0] && STUDENTS[0].id) || null;
  const student = userId ? getStudent(userId) : null;

  if (!student) {
    return { props: { student: null, userId, bundle: null } };
  }

  // 과목별 오늘의 세트 준비 (AI 생성 or 정적 폴백, 캐시 사용)
  const bundle = {};
  for (const s of SUBJECT_LIST) {
    const set = await getOrCreateDailySet(student, s);
    bundle[s] = { concept: set.concept, level: set.level, questions: set.questions, source: set.source, unit: set.unit };
  }
  return { props: { student, userId, bundle } };
}

function Svg({ svg }) {
  if (!svg) return null;
  return (
    <div
      style={{ margin: "10px 0" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function Home({ student, userId, bundle }) {
  const [subject, setSubject] = useState("수학");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!student) {
    return (
      <div style={{ maxWidth: 640, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
        <h1>사용자를 찾을 수 없어요</h1>
        <p>주소에 <code>?user=아이디</code> 를 붙여 접속하거나, 먼저 로그인해주세요.</p>
        <a href="/login">로그인 페이지로 가기</a>
      </div>
    );
  }

  const data = bundle[subject];
  const level = data.level;
  const questions = data.questions || [];

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      const questionIds = questions.map((q) => q.id);
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subject, level, answers, questionIds }),
      });
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>오늘의 학습</h1>
        <span style={{ color: "#666" }}>{student.name} · {student.grade}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <a href={`/wrongnotes?user=${encodeURIComponent(userId)}`} style={{ fontSize: 14 }}>
          📒 오답노트 보기
        </a>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {SUBJECT_LIST.map((s) => (
          <button
            key={s}
            onClick={() => { setSubject(s); setAnswers({}); setResult(null); }}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: subject === s ? "2px solid #333" : "1px solid #ccc",
              background: subject === s ? "#333" : "#fff",
              color: subject === s ? "#fff" : "#333", cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: "#f6f6f6", padding: 16, borderRadius: 10, marginBottom: 24 }}>
        <div style={{ marginBottom: 6 }}>
          {data.source === "ai" ? (
            <span style={{ fontSize: 12, background: "#e7f0ff", color: "#1e5bd6", padding: "3px 8px", borderRadius: 12 }}>
              ✨ AI가 오늘 만든 문제{data.unit ? ` · 단원: ${data.unit}` : ""}
            </span>
          ) : data.source === "bank" ? (
            <span style={{ fontSize: 12, background: "#eafbe7", color: "#1e8a3d", padding: "3px 8px", borderRadius: 12 }}>
              📦 미리 준비된 문제{data.unit ? ` · 단원: ${data.unit}` : ""}
            </span>
          ) : (
            <span style={{ fontSize: 12, background: "#eee", color: "#666", padding: "3px 8px", borderRadius: 12 }}>
              📚 문제은행 문제
            </span>
          )}
        </div>
        <h3>{data.concept.title}</h3>
        <Svg svg={data.concept.image} />
        <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{data.concept.body}</p>
        <p style={{ fontSize: 12, color: "#888" }}>오늘 난이도: {level}</p>
      </div>

      {questions.length === 0 && (
        <p style={{ color: "#c00" }}>이 난이도({level})의 문제가 아직 없어요.</p>
      )}

      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 18 }}>
          <p><b>{i + 1}.</b> {q.q}</p>
          <Svg svg={q.image} />
          {q.type === "mcq" ? (
            q.choices.map((c) => (
              <label key={c} style={{ display: "block", marginLeft: 12 }}>
                <input type="radio" name={`q${q.id}`} checked={answers[q.id] === c}
                  onChange={() => setAnswer(q.id, c)} /> {c}
              </label>
            ))
          ) : (
            <input type="text" value={answers[q.id] || ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              style={{ marginLeft: 12, padding: 6, width: "60%" }} placeholder="답을 입력하세요" />
          )}
        </div>
      ))}

      {questions.length > 0 && (
        <button onClick={submit} disabled={loading}
          style={{ padding: "12px 24px", fontSize: 16, background: "#333", color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer" }}>
          {loading ? "채점 중..." : "제출하고 채점하기"}
        </button>
      )}

      {result && !result.error && (
        <div style={{ marginTop: 24, padding: 16, background: "#eef7ee", borderRadius: 10 }}>
          <h3>결과: {result.correctCount} / {result.total} ({result.percent}%)</h3>
          <p>카카오톡으로 결과를 보냈어요{result.kakaoSent === false ? " (일부 발송 실패)" : ""}.</p>
          <p>다음 학습 난이도: <b>{result.nextLevel}</b></p>
          <a href={`/wrongnotes?user=${encodeURIComponent(userId)}`}>틀린 문제는 오답노트에서 복습하기 →</a>
        </div>
      )}
      {result && result.error && (
        <div style={{ marginTop: 24, padding: 16, background: "#fdeaea", borderRadius: 10 }}>
          <p>오류: {result.error}</p>
        </div>
      )}
    </div>
  );
}
