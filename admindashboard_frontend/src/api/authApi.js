// Central authentication + token store.
// Replaces the hardcoded VITE_API_ACCESS_TOKEN: the access/refresh tokens now
// come from POST /api/auth/login/ and are persisted in localStorage. Every other
// api module reads the current token via getAccessToken()/authHeaders(), so the
// token is always read dynamically at call time (never captured at import time).

// Backend API root, from .env (VITE_API_BASE_URL). Single source of truth for
// every api module — they import this exported constant rather than reading env.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_URL = `${API_BASE_URL}/auth/login/`;
const REFRESH_URL = `${API_BASE_URL}/auth/token/refresh/`;
const ME_URL = `${API_BASE_URL}/auth/me/`;

const ACCESS_KEY = "rms_access_token";
const REFRESH_KEY = "rms_refresh_token";
const USER_KEY = "rms_user";

// Optional fallback so a token in .env (if present) still works during transition.
const ENV_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN || "";

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_KEY) || ENV_TOKEN;
  } catch {
    return ENV_TOKEN;
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY) || "";
  } catch {
    return "";
  }
}

export function setTokens(access, refresh) {
  try {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    /* storage unavailable */
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

// Standard headers for authenticated JSON requests. Reads the token on every call.
export function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

export function getStoredUser() {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

// Decode a JWT payload (no signature verification) to read claims like user_id.
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

// GET /api/auth/me/ -> current user's profile (best-effort; shape may vary).
export async function fetchMe() {
  const res = await fetch(ME_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  return res.json();
}

// POST /api/auth/login/ { email, password } -> { access, refresh }.
// Stores the tokens, then resolves a display user (from /auth/me/ when available,
// otherwise derived from the JWT/email) and caches it.
export async function login(email, password) {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let msg = "Invalid email or password.";
    try {
      const err = await res.json();
      msg = err.detail || Object.values(err).flat().join(" ") || msg;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(msg);
  }

  const data = await res.json();
  setTokens(data.access, data.refresh);

  const claims = decodeJwt(data.access || "");
  const prefix = email.split("@")[0] || "User";
  let user = {
    email,
    name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
    role: "admin",
    userId: claims.user_id ?? null,
  };

  // Enrich from the profile endpoint when it's available.
  try {
    const me = await fetchMe();
    user = {
      ...user,
      name: me.name || me.full_name || `${me.first_name || ""} ${me.last_name || ""}`.trim() || user.name,
      email: me.email || user.email,
      role: me.role || me.user_type || user.role,
      userId: me.id ?? user.userId,
    };
  } catch {
    /* profile endpoint optional; keep the derived user */
  }

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  return user;
}

// POST /api/auth/token/refresh/ { refresh } -> { access }. Returns the new access
// token, or null if refresh is unavailable/expired (caller should force re-login).
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access) {
      setTokens(data.access, data.refresh);
      return data.access;
    }
  } catch {
    /* network error */
  }
  return null;
}

export function logout() {
  clearAuth();
}
