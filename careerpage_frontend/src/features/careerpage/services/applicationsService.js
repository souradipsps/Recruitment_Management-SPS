// Network layer for the "Submit Profile" (general / talent-pool application) flow.
// Two-step: save the candidate's profile (PUT /auth/me/, multipart so the resume
// file can ride along), then create the application record
// (POST /general-applications/).

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The Apply form's experience dropdown uses marketing-friendly labels that
// don't line up with CandidateProfile.years_of_experience's fixed choice
// codes ("0-1", "1-2", "2-4", "3-5", "5-8", "8+") — the backend rejects
// anything else with a 400. Map each UI label to its nearest valid code.
const EXPERIENCE_LABEL_TO_CODE = {
  "0–1 years (Fresher)": "0-1",
  "1–3 years": "1-2",
  "3–5 years": "3-5",
  "5–8 years": "5-8",
  "8+ years": "8+",
};

// Turn a Django REST Framework error body into one readable sentence.
function parseApiError(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  if (typeof body.detail === "string") return body.detail;
  const firstKey = Object.keys(body)[0];
  if (!firstKey) return fallback;
  const val = body[firstKey];
  const msg = Array.isArray(val) ? val[0] : val;
  return typeof msg === "string" ? msg : fallback;
}

/**
 * Save the candidate's profile fields collected in the Apply form.
 * PUT /api/auth/me/ — the backend expects the nested profile fields as a JSON
 * string under the "profile" key (so the resume file can share the same
 * multipart body), and the file itself under "profile.resume".
 */
export async function updateCandidateProfile(profile, resumeFile) {
  const form = new FormData();
  if (profile.firstName) form.append("first_name", profile.firstName);
  if (profile.lastName) form.append("last_name", profile.lastName);
  if (profile.phone) form.append("phone", profile.phone);

  form.append("profile", JSON.stringify({
    current_location: profile.location,
    educational_qualification: profile.education,
    degree_name: profile.degreeName,
    professional_qualification: profile.professionalQualification,
    professional_degree_name: profile.professionalQualificationOther,
    extracurricular_qualification: profile.extracurricular,
    extracurricular_degree_name: profile.extracurricularOther,
    years_of_experience: EXPERIENCE_LABEL_TO_CODE[profile.experience] || profile.experience,
    roles_interested: profile.selectedRoles,
    skills: profile.selectedSkills,
    salary_expectation: profile.salary,
    linkedin_profile: profile.linkedin,
    portfolio_link: profile.portfolio,
  }));

  if (resumeFile) form.append("profile.resume", resumeFile);

  const res = await fetch(`${BASE_URL}/auth/me/`, {
    method: "PUT",
    headers: authHeaders(),
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not save your profile. Please try again."));
  }
  return data;
}

/**
 * Create the general (talent-pool) application record.
 * POST /api/general-applications/
 */
export async function submitGeneralApplication({ preferredRole, experience, qualification }) {
  const res = await fetch(`${BASE_URL}/general-applications/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      preferred_role: preferredRole,
      experience,
      qualification,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not submit your application. Please try again."));
  }
  return data;
}
