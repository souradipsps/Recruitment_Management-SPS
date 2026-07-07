// Job Applications API client (GET /applications/, PATCH /applications/{id}/update_status/).
// Uses the access token from .env (no login flow yet), mirroring jobPostingsApi.js.
// Note: general applications (POST /general-applications/) are a separate,
// unrelated resource and are intentionally not handled here.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/applications/`;
const ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
});

// Map one API record -> the shape the Applications screen expects.
// GET /applications/ only returns id, app_id, role, posting, candidate_name,
// status, applied_date — fields the current table also shows (email, phone,
// experience, qualification, referredBy, resume) are not part of this
// endpoint's response, so they're placeheld with "—" rather than invented.
export const normalizeApplication = (r) => ({
  id: r.app_id || String(r.id),
  backendId: r.id,
  name: r.candidate_name || "",
  role: r.role || "",
  jobPostingId: r.posting ?? null,
  status: r.status || "Applied",
  applied: r.applied_date || "",
  email: "—",
  exp: "—",
  qualification: "—",
  referredBy: "—",
  phone: "—",
  resume: null,
});

// GET /api/applications/ -> normalized array (admin: all job-posting applications).
export async function fetchApplications() {
  const res = await fetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load applications (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeApplication);
}

// PATCH /api/applications/{backendId}/update_status/
export async function updateApplicationStatus(backendId, status, adminNote = "") {
  const res = await fetch(`${API_URL}${backendId}/update_status/`, {
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
