// 카카오 로그인 + "나에게 보내기" 메시지 발송 관련 함수 모음

const REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

// 1) 로그인 시작 URL (딸/부모님이 처음 한 번 이 링크로 로그인해서 토큰을 발급받음)
export function getKakaoLoginUrl(state) {
  const params = new URLSearchParams({
    client_id: REST_API_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    state: state || "",
  });
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

// 2) 로그인 콜백에서 받은 code를 access_token/refresh_token으로 교환
export async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: REST_API_KEY,
    redirect_uri: REDIRECT_URI,
    code,
  });

  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`카카오 토큰 발급 실패: ${errText}`);
  }
  return res.json(); // { access_token, refresh_token, expires_in, ... }
}

// 3) refresh_token으로 access_token 재발급 (액세스 토큰은 보통 몇 시간짜리라 매일 자동 갱신 필요)
export async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: REST_API_KEY,
    refresh_token: refreshToken,
  });

  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`토큰 갱신 실패: ${errText}`);
  }
  return res.json();
}

// 4) "나에게 보내기" - 로그인한 본인의 카카오톡(나와의 채팅방)으로 메시지 발송
//    accessToken은 메시지를 받을 사람(딸 또는 부모님) 본인의 access_token이어야 함
export async function sendToMe(accessToken, { title, description, linkUrl, buttonText }) {
  const templateObject = {
    object_type: "text",
    text: `${title}\n\n${description}`,
    link: {
      web_url: linkUrl,
      mobile_web_url: linkUrl,
    },
    button_title: buttonText || "링크 열기",
  };

  const params = new URLSearchParams({
    template_object: JSON.stringify(templateObject),
  });

  const res = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`카카오톡 메시지 발송 실패: ${errText}`);
  }
  return res.json();
}
