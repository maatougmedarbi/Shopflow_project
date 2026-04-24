const API_BASE = "http://127.0.0.1:8081";
const ACCESS_COOKIE = "shopflow_accessToken";
const ROLE_COOKIE = "shopflow_role";

function getCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

function setCookie(name, value, maxAgeSeconds) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (typeof localStorage !== "undefined") {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      return token;
    }
  }

  return getCookie(ACCESS_COOKIE);
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("token", accessToken);

    const payload = decodeJwtPayload(accessToken);
    const role = payload?.role || "";

    setCookie(ACCESS_COOKIE, accessToken, 60 * 60);
    if (role) {
      setCookie(ROLE_COOKIE, role, 60 * 60);
    }
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");

  clearCookie(ACCESS_COOKIE);
  clearCookie(ROLE_COOKIE);
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiFetch(path, options = {}, retry = true) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      return res;
    }
    const retryHeaders = new Headers(options.headers || {});
    retryHeaders.set("Authorization", `Bearer ${newToken}`);
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: retryHeaders,
    });
  }

  return res;
}

export { API_BASE };
