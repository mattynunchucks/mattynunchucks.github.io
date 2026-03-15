const API_URL = `${import.meta.env.BASE_URL}api/save.php`;
const TOKEN_KEY = "cgu_cloud_token";

export function getOrCreateToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export async function cloudPush(saveString) {
  const token = getOrCreateToken();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, save_data: saveString }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

export async function cloudPull(token) {
  const t = token || getToken();
  if (!t) return null;
  const res = await fetch(`${API_URL}?token=${encodeURIComponent(t)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.save_data ?? null;
}
