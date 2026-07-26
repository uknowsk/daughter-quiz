import { STUDENTS } from "../lib/users";

export async function getServerSideProps() {
  return { props: { students: STUDENTS } };
}

export default function Login({ students }) {
  return (
    <div style={{ maxWidth: 460, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>최초 1회 카카오 로그인</h1>
      <p style={{ color: "#555" }}>
        각 학생과 학부모가 아래 버튼으로 한 번씩만 로그인하면,
        <br />이후 매일 자동으로 카카오톡 알림이 발송돼요.
      </p>

      {students.map((s) => (
        <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <b>{s.name}</b> <span style={{ color: "#888" }}>· {s.grade}</span>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <a href={`/api/auth/kakao/start?who=${encodeURIComponent(s.id)}`} style={{ flex: 1 }}>
              <button style={btn}>{s.name} 본인 로그인</button>
            </a>
            <a href={`/api/auth/kakao/start?who=${encodeURIComponent(s.id + "_parent")}`} style={{ flex: 1 }}>
              <button style={{ ...btn, background: "#ffe9a8" }}>학부모 로그인</button>
            </a>
          </div>
        </div>
      ))}

      {students.length === 0 && (
        <p style={{ color: "#c00" }}>lib/users.js 에 학생을 먼저 추가해주세요.</p>
      )}
    </div>
  );
}

const btn = {
  width: "100%", padding: "12px 8px", fontSize: 15, background: "#FEE500",
  border: "none", borderRadius: 8, cursor: "pointer",
};
