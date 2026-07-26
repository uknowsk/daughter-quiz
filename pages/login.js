export default function Login() {
  return (
    <div style={{ maxWidth: 420, margin: "60px auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>최초 1회 카카오 로그인</h1>
      <p style={{ color: "#555" }}>
        딸과 부모님이 각각 아래 버튼으로 한 번씩만 로그인해주세요.
        <br />
        이후엔 자동으로 카카오톡 알림이 발송돼요.
      </p>
      <a href="/api/auth/kakao/start?role=daughter">
        <button style={btnStyle}>딸 계정으로 로그인</button>
      </a>
      <br />
      <a href="/api/auth/kakao/start?role=parent">
        <button style={btnStyle}>부모님 계정으로 로그인</button>
      </a>
    </div>
  );
}

const btnStyle = {
  margin: "12px 0",
  padding: "14px 24px",
  fontSize: 16,
  background: "#FEE500",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
};
