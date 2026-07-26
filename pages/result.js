import { getResult } from "../lib/store";
import { getStudent } from "../lib/users";

export async function getServerSideProps({ query }) {
  const userId = query.user || null;
  const subject = query.subject || "수학";
  const student = userId ? getStudent(userId) : null;
  const result = userId ? (await getResult(userId, subject)) || null : null;
  return { props: { userId, subject, student, result } };
}

function Svg({ svg }) {
  if (!svg) return null;
  return <div style={{ margin: "8px 0" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function Result({ userId, subject, student, result }) {
  const name = student ? student.name : "";
  if (!result) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
        <h1>{name} {subject} 결과</h1>
        <p>아직 채점 기록이 없어요. 문제를 먼저 풀고 제출해주세요.</p>
        <a href={`/?user=${encodeURIComponent(userId || "")}`}>오늘의 학습으로 돌아가기</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>{name} · {subject} 결과</h1>
      <div style={{ background: "#eef7ee", padding: 16, borderRadius: 10, marginBottom: 20 }}>
        <p style={{ fontSize: 18, margin: 0 }}>
          <b>{result.correctCount} / {result.total}</b> 정답 ({result.percent}%)
        </p>
        <p style={{ margin: "4px 0 0", color: "#555" }}>
          난이도: {result.level} → 다음: <b>{result.nextLevel}</b>
        </p>
      </div>

      <h3>문제별 결과</h3>
      {result.detail.map((d, i) => (
        <div key={d.id} style={{
          padding: 12, marginBottom: 8, borderRadius: 8,
          background: d.isCorrect ? "#f2fbf2" : "#fdeeee",
          border: `1px solid ${d.isCorrect ? "#bfe3bf" : "#f0bcbc"}`,
        }}>
          <p style={{ margin: 0 }}><b>{i + 1}. {d.isCorrect ? "✅" : "❌"}</b> {d.q}</p>
          <Svg svg={d.image} />
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555" }}>
            내 답: {d.given || "(입력 안 함)"} {!d.isCorrect && <> / 정답: {d.answer}</>}
          </p>
        </div>
      ))}

      <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
        <a href={`/?user=${encodeURIComponent(userId || "")}`}>오늘의 학습</a>
        <a href={`/wrongnotes?user=${encodeURIComponent(userId || "")}`}>📒 오답노트</a>
      </div>
    </div>
  );
}
