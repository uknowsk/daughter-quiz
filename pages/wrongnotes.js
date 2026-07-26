import { getWrongNotes } from "../lib/store";
import { getStudent } from "../lib/users";

export async function getServerSideProps({ query }) {
  const userId = query.user || null;
  const student = userId ? getStudent(userId) : null;
  const notes = userId ? await getWrongNotes(userId) : [];
  // 최신순
  notes.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  return { props: { userId, student, notes } };
}

function Svg({ svg }) {
  if (!svg) return null;
  return <div style={{ margin: "8px 0" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function WrongNotes({ userId, student, notes }) {
  const name = student ? student.name : "";

  // 과목별로 묶기
  const bySubject = {};
  for (const n of notes) {
    (bySubject[n.subject] = bySubject[n.subject] || []).push(n);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>📒 {name} 오답노트</h1>
      <p style={{ color: "#666" }}>
        틀린 문제가 모여요. 다음에 같은 문제를 맞히면 자동으로 목록에서 사라져요.
      </p>

      {notes.length === 0 && (
        <p style={{ color: "#2a7", marginTop: 24 }}>
          아직 오답이 없어요! 👏 문제를 풀면 틀린 문제가 여기에 쌓여요.
        </p>
      )}

      {Object.entries(bySubject).map(([subject, list]) => (
        <div key={subject} style={{ marginTop: 20 }}>
          <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: 6 }}>
            {subject} <span style={{ color: "#999", fontSize: 14 }}>({list.length}개)</span>
          </h3>
          {list.map((n) => (
            <div key={n.key} style={{
              padding: 12, marginBottom: 8, borderRadius: 8,
              background: "#fffdf5", border: "1px solid #f0e2b8",
            }}>
              <p style={{ margin: 0 }}>
                <span style={{ fontSize: 12, color: "#b08900" }}>[{n.level}]</span> {n.q}
              </p>
              <Svg svg={n.image} />
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>
                <span style={{ color: "#c00" }}>내 답: {n.given || "(입력 안 함)"}</span>
                {"  "}·{"  "}
                <span style={{ color: "#2a7" }}>정답: <b>{n.answer}</b></span>
              </p>
              {(n.explain || n.conceptTitle) && (
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#555", background: "#fff8e6", padding: "6px 8px", borderRadius: 6 }}>
                  💡 {n.explain ? n.explain : `관련 개념: ${n.conceptTitle} — 문제 페이지 위쪽 개념 설명을 다시 확인해보세요.`}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <a href={`/?user=${encodeURIComponent(userId || "")}`}>← 오늘의 학습으로</a>
      </div>
    </div>
  );
}
