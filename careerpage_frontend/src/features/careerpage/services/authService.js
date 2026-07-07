// Central place for every authentication network call used by the login modal.
//
// The bodies below are currently client-side mocks so the UI works without a
// backend. When the real API is ready, replace each body with an HTTP request
// (fetch / axios). Keep the function names and the shape of the resolved value
// the same and none of the form components will need to change.
//
// Each function throws an Error on failure — the forms catch it and show
// `error.message` to the user.

/* eslint-disable no-unused-vars -- some params are the API contract for
   endpoints that are still mocked; the real HTTP calls will use every one. */

// API base URL comes solely from the environment (.env → VITE_API_BASE_URL).
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

// Turn a Django REST Framework error body into one readable sentence.
// DRF returns either { field: ["msg", ...], ... } or { detail: "msg" }.
export function parseApiError(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  if (typeof body.detail === "string") return body.detail;
  const firstKey = Object.keys(body)[0];
  if (!firstKey) return fallback;
  const val = body[firstKey];
  const msg = Array.isArray(val) ? val[0] : val;
  return typeof msg === "string" ? msg : fallback;
}

// Persist the JWT pair so later authenticated requests can send the access
// token (e.g. `Authorization: Bearer <access>`).
function saveAuthTokens(tokens) {
  if (!tokens) return;
  if (tokens.access) localStorage.setItem("accessToken", tokens.access);
  if (tokens.refresh) localStorage.setItem("refreshToken", tokens.refresh);
}

/**
 * Authenticate an existing candidate.
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<{ name: string }>}
 */
export async function loginUser({ identifier, password }) {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: identifier, password }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Invalid credentials. Please try again."));
  }

  // Success body: { access, refresh } (SimpleJWT — no user object is returned,
  // so the display name is derived from the email local part for now).
  saveAuthTokens(data);

  const name = identifier.includes("@") ? identifier.split("@")[0] : identifier;
  return { name };
}

/**
 * Register a new candidate account.
 * POST /api/auth/register/  (Django REST Framework).
 * @param {{ name: string, lastName: string, email: string, phone: string, password: string, confirmPassword: string }} data
 * @returns {Promise<{ name: string, lastName: string, email: string, phone: string }>}
 */
export async function signupUser({ name, lastName, email, phone, password, confirmPassword }) {
  const res = await fetch(`${BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: name,
      last_name: lastName,
      email,
      phone,
      password,
      confirm_password: confirmPassword ?? password,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not create account. Please try again."));
  }

  // Success body: { message, user: {...}, tokens: { access, refresh } }
  saveAuthTokens(data?.tokens);

  return {
    name: data?.user?.first_name ?? name,
    lastName: data?.user?.last_name ?? lastName,
    email: data?.user?.email ?? email,
    phone: data?.user?.phone ?? phone,
  };
}

/**
 * Send a password-reset OTP to the given email.
 * @param {{ email: string }} data
 * @returns {Promise<{ success: true }>}
 */
export async function sendPasswordResetOtp({ email }) {
  // TODO: POST `${BASE_URL}/auth/forgot-password`
  return { success: true };
}

/**
 * Verify the OTP the candidate received by email.
 * @param {{ email: string, otp: string }} data
 * @returns {Promise<{ success: true }>}
 */
export async function verifyPasswordResetOtp({ email, otp }) {
  // TODO: POST `${BASE_URL}/auth/verify-otp`
  // Demo mode accepts any 6-digit OTP (validated in the form).
  return { success: true };
}

/**
 * Set a new password after OTP verification.
 * @param {{ email: string, otp: string, newPassword: string }} data
 * @returns {Promise<{ success: true }>}
 */
export async function resetPassword({ email, otp, newPassword }) {
  // TODO: POST `${BASE_URL}/auth/reset-password`
  return { success: true };
}
