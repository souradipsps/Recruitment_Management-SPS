// Network layer for candidate profile updates and application submissions
// (talent-pool "general" applications and job-specific applications).

import { parseApiError } from "./authService";

// Base URL comes solely from the environment (.env → VITE_API_BASE_URL), same
// as ./authService.js and ./jobsService.js.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

function requireAuthToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("You must be logged in to do this. Please log in and try again.");
  return token;
}

function combineQualification(education, degreeName) {
  return degreeName ? `${education} (${degreeName})` : education;
}

/**
 * Save the candidate's profile fields (and optionally a new resume file).
 * PUT /api/auth/me/
 * @param {object} profileFields camelCase UI fields — see mapping in the plan
 * @param {File|null} resumeFile a freshly-picked resume file, if any
 * @returns {Promise<object>} updated user data (no `profile` sub-object)
 */
export async function updateUserProfile(profileFields, resumeFile = null) {
  const token = requireAuthToken();
  const {
    firstName, lastName, phone,
    location, education, degreeName, professionalQualification, professionalQualificationOther,
    experience, salary, extracurricular, extracurricularOther,
    selectedRoles, selectedSkills, linkedin, portfolio,
  } = profileFields;

  const profile = {
    current_location: location,
    educational_qualification: education,
    degree_name: degreeName,
    professional_qualification: professionalQualification,
    professional_degree_name: professionalQualificationOther,
    extracurricular_qualification: extracurricular,
    extracurricular_degree_name: extracurricularOther,
    // The experience dropdowns' `value`s are already the exact backend choice
    // codes ("0-1","1-2","2-4","3-5","5-8","8+") — same value goes straight
    // into `GeneralApplication.experience`/`JobApplication.experience` too.
    years_of_experience: experience ?? "",
    roles_interested: selectedRoles ?? [],
    skills: selectedSkills ?? [],
    salary_expectation: salary,
    linkedin_profile: linkedin,
    portfolio_link: portfolio,
  };

  let res;
  if (resumeFile) {
    const formData = new FormData();
    if (firstName !== undefined) formData.append("first_name", firstName);
    if (lastName !== undefined) formData.append("last_name", lastName);
    if (phone !== undefined) formData.append("phone", phone);
    formData.append("profile", JSON.stringify(profile));
    formData.append("resume", resumeFile);

    res = await fetch(`${BASE_URL}/auth/me/`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData,
    });
  } else {
    res = await fetch(`${BASE_URL}/auth/me/`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, phone, profile }),
    });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not save your profile. Please try again."));
  }
  return data;
}

/**
 * Fetch the current candidate's user + profile data.
 * GET /api/auth/me/
 * @returns {Promise<object>} raw response — { id, email, first_name, last_name, phone, role, full_name, profile }
 */
export async function fetchUserProfile() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/auth/me/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not load your profile."));
  }
  return data;
}

/**
 * Map the raw `GET /api/auth/me/` response onto the shape the frontend's
 * `savedProfileData` state already uses (see src/lib/profileData.js) — used
 * to prefill the profile/application forms after login without requiring the
 * candidate to re-enter details they already saved in a previous session.
 * @param {object|null} userData response from fetchUserProfile()
 * @returns {object|null} savedProfileData-shaped object, or null if no profile exists yet
 */
export function mapUserResponseToSavedProfile(userData) {
  const profile = userData?.profile;
  if (!profile) return null;

  const resumePath = profile.resume || "";
  const resumeUrl = resumePath
    ? (resumePath.startsWith("http") ? resumePath : `${new URL(BASE_URL).origin}${resumePath}`)
    : "";

  return {
    fullName: [userData.first_name, userData.last_name].filter(Boolean).join(" "),
    email: userData.email || "",
    phone: userData.phone || "",
    location: profile.current_location || "",
    education: profile.educational_qualification || "",
    degreeName: profile.degree_name || "",
    professionalQualification: profile.professional_qualification || "",
    professionalQualificationOther: profile.professional_degree_name || "",
    experience: profile.years_of_experience || "",
    salary: profile.salary_expectation || "",
    extracurricular: profile.extracurricular_qualification || "",
    extracurricularOther: profile.extracurricular_degree_name || "",
    selectedRoles: profile.roles_interested || [],
    selectedSkills: profile.skills || [],
    linkedin: profile.linkedin_profile || "",
    portfolio: profile.portfolio_link || "",
    resumeFile: resumePath ? resumePath.split("/").pop() : "",
    resumeUrl,
  };
}

/**
 * Fetch the current candidate's own job applications (job-specific, tied to a
 * posting — not the talent-pool general applications).
 * GET /api/applications/
 * @returns {Promise<object[]>} raw JobApplication records
 */
export async function fetchMyJobApplications() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/applications/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not load your applications."));
  }
  // Endpoint is paginated ({ results: [...] }); tolerate a bare array too.
  return Array.isArray(data) ? data : data?.results ?? [];
}

/**
 * Submit a General Application (talent pool) — not tied to a job posting.
 * POST /api/general-applications/
 * @param {{ selectedRoles: string[], experience: string, education: string, degreeName: string }} fields
 */
export async function submitGeneralApplication({ selectedRoles, experience, education, degreeName }) {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/general-applications/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      // Stringified to match the same array format `roles_interested` holds
      // on CandidateProfile — preferred_role is a plain CharField, so it can't
      // store an actual array, but this keeps the serialized text identical.
      preferred_role: JSON.stringify(selectedRoles ?? []),
      experience,
      qualification: combineQualification(education, degreeName),
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not submit your application. Please try again."));
  }
  return data;
}

/**
 * Submit a Job Application for a specific job posting.
 * POST /api/applications/
 * @param {number|string} jobId the job posting id
 * @param {{ experience: string, education: string, degreeName: string, coverLetter: string, noticePeriod: string, hasReferral: string, referralEmpId: string }} fields
 */
export async function submitJobApplication(jobId, {
  experience, education, degreeName, coverLetter, noticePeriod, hasReferral, referralEmpId,
}) {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/applications/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      posting: jobId,
      experience,
      qualification: combineQualification(education, degreeName),
      cover_letter: coverLetter,
      notice_period: noticePeriod,
      has_referral: hasReferral === "Yes",
      referral_emp_id: referralEmpId,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not submit your application. Please try again."));
  }
  return data;
}
