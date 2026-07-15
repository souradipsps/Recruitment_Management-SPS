// Applications API client — job-posting applications (GET /applications/,
// PATCH /applications/{id}/update_status/) and general applications
// (GET /general-applications/, PATCH /general-applications/{id}/).
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, authFetch, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/applications/`;
const GENERAL_API_URL = `${API_BASE_URL}/general-applications/`;

// Map one API record -> the shape the Applications screen expects.
// The live API returns richer data than documented — candidate contact info,
// experience, qualification, referral, and resume are all present on the
// response and used directly rather than placeheld.
export const normalizeApplication = (r) => ({
  id: r.app_id || String(r.id),
  backendId: r.id,
  name: r.candidate_name || "",
  role: r.role || "",
  jobPostingId: r.posting ?? null,
  status: r.status || "Applied",
  applied: r.applied_date || "",
  email: r.candidate_email || "—",
  exp: r.experience || "—",
  qualification: r.qualification || "—",
  referredBy: r.has_referral ? (r.referral_emp_id || r.referred_by || "—") : "—",
  phone: r.candidate_phone || "—",
  resume: r.resume || null,
  candidateId: r.candidate ?? null,  // Candidate model FK, threaded through to offer creation
});

// GET /api/applications/ -> normalized array (admin: all job-posting applications).
export async function fetchApplications() {
  const res = await authFetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load applications (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeApplication);
}

// PATCH /api/applications/{backendId}/update_status/
export async function updateApplicationStatus(backendId, status, adminNote = "") {
  const res = await authFetch(`${API_URL}${backendId}/update_status/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status, ...(adminNote ? { admin_note: adminNote } : {}) }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update application status (${res.status}): ${errText}`);
  }

  return res.json();
}

// Map one general-application API record -> the shape the Applications screen expects.
export const normalizeGeneralApplication = (r) => ({
  id: r.app_id || String(r.id),
  backendId: r.id,
  name: r.candidate_name || "",
  preferredRole: r.preferred_role || "",
  location: r.location || "",
  status: r.status || "Applied",
  applied: r.applied_date || "",
  email: r.candidate_email || "—",
  exp: r.experience || "—",
  qualification: r.qualification || "—",
  phone: r.candidate_phone || "—",
  resume: r.resume || null,
  candidateId: r.candidate ?? null,  // Candidate model FK, threaded through to offer creation
});

// GET /api/general-applications/ -> normalized array (admin: all general/profile applications).
export async function fetchGeneralApplications() {
  const res = await authFetch(GENERAL_API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load general applications (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeGeneralApplication);
}

// PATCH /api/general-applications/{backendId}/ — no dedicated update_status action,
// so this uses the ModelViewSet's partial_update (HR Admin only).
export async function updateGeneralApplicationStatus(backendId, status, adminNote = "") {
  const res = await authFetch(`${GENERAL_API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status, ...(adminNote ? { admin_note: adminNote } : {}) }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update general application status (${res.status}): ${errText}`);
  }

  return res.json();
}
