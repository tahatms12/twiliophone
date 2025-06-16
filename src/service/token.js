export async function fetchToken() {
  const resp = await fetch(process.env.REACT_APP_TWILIO_ACCESS_TOKEN_SERVER_URL);
  const data = await resp.json();
  return data.token;
}
