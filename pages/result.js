import { getResult } from "../lib/store";

export async function getServerSideProps({ query }) {
  const subject = query.subject || "수학";
  const result = (await getResult(subject)) || null;
  return { props: { subject, result } };
}

export default function Result({ subject, result }) {
  if (!result) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
        <h1>{subject} 결과</h1>
        <p>아직 채점 기록이 없어요. 문제를 먼저 풀고 제출해주세요.</p>
        <a href="/">오늘의 학습으로 돌아가기</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>{subject} 결과</h1>
      <div style={{ background: "#eef7ee", padding: 16, borderRadius: 10, marginBottom: 20 }}>
        <p style={{ fontSize: 18, margin: 0 }}>
          <b>
            {result.correctCount} / {result.total}
          </b>{" "}
          정답 ({result.percent}%)
        </p>
        <p style={{ margin: "4px 0 0", color: "#555" }}>
          풀었던 난이도: {result.level} → 다음 난이도: <b>{result.nextLevel}</b>
        </p>
      </div>

      <h3>문제별 결과</h3>
      {result.detail.map((d, i) => (
        <div
          key={d.id}
          style={{
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            background: d.isCorrect ? "#f2fbf2" : "#fdeeee",
            border: `1px solid ${d.isCorrect ? "#bfe3bf" : "#f0bcbc"}`,
          }}
        >
          <p style={{ margin: 0 }}>
            <b>{i + 1}. {d.isCorrect ? "✅" : "❌"}</b> {d.q}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555" }}>
            내 답: {d.given || "(입력 안 함)"} {!d.isCorrect && <> / 정답: {d.answer}</>}
          </p>
        </div>
      ))}

      <a href="/">오늘의 학습으로 돌아가기</a>
    </div>
  );
}
