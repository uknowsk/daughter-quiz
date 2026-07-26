import { useState } from "react";
import math from "../lib/curriculum/math";
import science from "../lib/curriculum/science";
import social from "../lib/curriculum/social";
import { getProgress } from "../lib/store";

const SUBJECTS = { 수학: math, 과학: science, 사회: social };

export async function getServerSideProps() {
  const progress = await getProgress();
  return { props: { progress } };
}

export default function Home({ progress }) {
  const [subject, setSubject] = useState("수학");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const level = progress[subject]?.level || "중";
  const data = SUBJECTS[subject];
  const questions = data.levels[level] || [];

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, level, answers }),
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
      <h1>오늘의 학습</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Object.keys(SUBJECTS).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSubject(s);
              setAnswers({});
              setResult(null);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: subject === s ? "2px solid #333" : "1px solid #ccc",
              background: subject === s ? "#333" : "#fff",
              color: subject === s ? "#fff" : "#333",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: "#f6f6f6", padding: 16, borderRadius: 10, marginBottom: 24 }}>
        <h3>{data.concept.title}</h3>
        <p style={{ whiteSpace: "pre-line" }}>{data.concept.body}</p>
        <p style={{ fontSize: 12, color: "#888" }}>오늘 난이도: {level}</p>
      </div>

      {questions.length === 0 && (
        <p style={{ color: "#c00" }}>
          이 난이도({level})의 문제가 아직 준비되지 않았어요. lib/curriculum/{subject === "수학" ? "math" : subject === "과학" ? "science" : "social"}.js 에 문항을 추가해주세요.
        </p>
      )}

      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 18 }}>
          <p>
            <b>{i + 1}.</b> {q.q}
          </p>
          {q.type === "mcq" ? (
            q.choices.map((c) => (
              <label key={c} style={{ display: "block", marginLeft: 12 }}>
                <input
                  type="radio"
                  name={`q${q.id}`}
                  checked={answers[q.id] === c}
                  onChange={() => setAnswer(q.id, c)}
                />{" "}
                {c}
              </label>
            ))
          ) : (
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              style={{ marginLeft: 12, padding: 6, width: "60%" }}
              placeholder="답을 입력하세요"
            />
          )}
        </div>
      ))}

      {questions.length > 0 && (
        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading ? "채점 중..." : "제출하고 채점하기"}
        </button>
      )}

      {result && !result.error && (
        <div style={{ marginTop: 24, padding: 16, background: "#eef7ee", borderRadius: 10 }}>
          <h3>
            결과: {result.correctCount} / {result.total} 정답 ({result.percent}%)
          </h3>
          <p>카카오톡으로 결과를 보냈어요{result.kakaoSent === false ? " (발송 실패, 콘솔 로그 확인 필요)" : ""}.</p>
          <p>다음 학습 난이도: <b>{result.nextLevel}</b></p>
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
