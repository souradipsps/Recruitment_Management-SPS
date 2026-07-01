// Central place for every authentication network call used by the login modal.
//
// The bodies below are currently client-side mocks so the UI works without a
// backend. When the real API is ready, replace each body with an HTTP request
// (fetch / axios). Keep the function names and the shape of the resolved value
// the same and none of the form components will need to change.
//
// Each function throws an Error on failure — the forms catch it and show
// `error.message` to the user.

/* eslint-disable no-unused-vars -- params are the API contract; the mock
   bodies ignore some of them, but the real HTTP calls will use every one. */

// const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

/**
 * Authenticate an existing candidate.
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<{ name: string }>}
 */
export async function loginUser({ identifier, password }) {
  // TODO: real integration
  // const res = await fetch(`${BASE_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ identifier, password }),
  // });
  // if (!res.ok) throw new Error("Invalid credentials. Please try again.");
  // return res.json();

  const name = identifier.includes("@") ? identifier.split("@")[0] : identifier;
  return { name };
}

/**
 * Register a new candidate account.
 * @param {{ name: string, lastName: string, email: string, phone: string, password: string }} data
 * @returns {Promise<{ name: string, lastName: string, email: string, phone: string }>}
 */
export async function signupUser({ name, lastName, email, phone, password }) {
  // TODO: POST `${BASE_URL}/auth/signup`
  return { name, lastName, email, phone };
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
