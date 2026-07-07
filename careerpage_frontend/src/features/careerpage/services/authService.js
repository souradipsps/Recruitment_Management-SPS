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
function parseApiError(body, fallback) {
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

export function mapBackendExperienceToFrontend(val) {
  if (!val) return "";
  if (val === "0-1") return "0–1 years (Fresher)";
  if (val === "1-2" || val === "1-3") return "1–3 years";
  if (val === "2-4" || val === "3-5" || val === "3-5 years") return "3–5 years";
  if (val === "5-8") return "5–8 years";
  if (val === "8+") return "8+ years";
  return val;
}

export function mapFrontendExperienceToBackend(val) {
  if (!val) return "";
  if (val.includes("0–1")) return "0-1";
  if (val.includes("1–3")) return "1-2";
  if (val.includes("3–5")) return "3-5";
  if (val.includes("5–8")) return "5-8";
  if (val.includes("8+")) return "8+";
  return val;
}

export function normalizeProfile(userAndProfile) {
  if (!userAndProfile) return null;
  const profile = userAndProfile.profile || {};
  
  let resumeFile = "";
  if (profile.resume) {
    const parts = profile.resume.split("/");
    resumeFile = parts[parts.length - 1];
  }
  
  let resumeUrl = profile.resume || "";
  if (resumeUrl && !resumeUrl.startsWith("http")) {
    const host = BASE_URL ? BASE_URL.replace(/\/api$/, "") : "";
    resumeUrl = `${host}${resumeUrl}`;
  }

  return {
    fullName: userAndProfile.full_name || `${userAndProfile.first_name || ""} ${userAndProfile.last_name || ""}`.trim(),
    email: userAndProfile.email || "",
    phone: userAndProfile.phone || "",
    location: profile.current_location || "Guwahati, Assam",
    education: profile.educational_qualification || "",
    degreeName: profile.degree_name || "",
    professionalQualification: profile.professional_qualification || "",
    professionalQualificationOther: profile.professional_degree_name || "",
    experience: mapBackendExperienceToFrontend(profile.years_of_experience),
    salary: profile.salary_expectation || "",
    extracurricular: profile.extracurricular_qualification || "",
    extracurricularOther: profile.extracurricular_degree_name || "",
    selectedRoles: profile.roles_interested || [],
    selectedSkills: profile.skills || [],
    linkedin: profile.linkedin_profile || "",
    portfolio: profile.portfolio_link || "",
    resumeFile,
    resumeUrl,
  };
}

/**
 * Fetch current user profile.
 * GET /api/auth/me/
 * @returns {Promise<object>}
 */
export async function fetchUserProfile() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");

  const res = await fetch(`${BASE_URL}/auth/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Failed to load profile."));
  }

  return data;
}

/**
 * Update candidate user profile and optionally upload a resume.
 * PUT /api/auth/me/
 * @param {object} profileData
 * @param {File} fileObj
 * @returns {Promise<object>}
 */
export async function updateUserProfile(profileData, fileObj) {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");

  const formData = new FormData();
  formData.append("first_name", profileData.name || "");
  formData.append("last_name", profileData.lastName || "");
  formData.append("phone", profileData.phone || "");

  const profileJson = {
    current_location: profileData.location || "",
    educational_qualification: profileData.highestEducation || "",
    degree_name: profileData.degreeName || "",
    professional_qualification: profileData.professionalQualification || "",
    professional_degree_name: profileData.professionalQualificationOther || "",
    years_of_experience: mapFrontendExperienceToBackend(profileData.experience),
    salary_expectation: profileData.salary || "",
    extracurricular_qualification: profileData.extracurricular || "",
    extracurricular_degree_name: profileData.extracurricularOther || "",
    roles_interested: profileData.roles || [],
    skills: profileData.skills || [],
    linkedin_profile: profileData.linkedin || "",
    portfolio_link: profileData.portfolio || "",
  };

  formData.append("profile", JSON.stringify(profileJson));

  if (fileObj) {
    formData.append("resume", fileObj);
  }

  const res = await fetch(`${BASE_URL}/auth/me/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Failed to update profile."));
  }

  return data;
}

