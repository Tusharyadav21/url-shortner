const API_BASE = {
  auth: "http://localhost:8000/auth",
  url: "http://localhost:8000",
  analytics: "http://localhost:8000",
};

const tokenKey = "access_token";

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function setStatus(el, message, type = "info") {
  el.textContent = message;
  el.className = `mt-3 text-sm ${type === "error" ? "text-rose-400" : "text-emerald-300"}`;
}

async function postJson(url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

async function getJson(url, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

window.App = {
  API_BASE,
  setToken,
  getToken,
  clearToken,
  setStatus,
  postJson,
  getJson,
};
