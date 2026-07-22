// Job Postings API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, authFetch, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/job-postings/`;

// Map one API record -> the shape the JobPostings screen expects.
export const normalizeJobPosting = (p) => ({
  id: p.posting_id || String(p.id),  // human id shown in the table (e.g. "JP-2026-0001")
  backendId: p.id,                   // numeric pk, used for publish/unpublish/delete
  role: p.role || "",
  existing_role: p.existing_role || null,
  department: p.department || "",
  channel: p.channel || "",
  status: p.status || "Unpublished",
  posted: p.posted_date || "",
  expiry: p.expiry_date || p.deadline || "",
  apps: p.application_count ?? 0,
  exp: p.experience || "",
  qual: p.qualification || p.educational_qualifications || "",
  type: p.type || "",
  salary: p.salary_range || "",
  location: p.location || "",
  description: p.description || "",
  category: (p.category || "").replace(/\s*Positions$/, ""),
  jobRequestId: p.job_request ?? null,
});

// GET /api/job-postings/ -> normalized array (admin: published + unpublished).
export async function fetchJobPostings() {
  const res = await authFetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load job postings (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeJobPosting);
}

// POST /api/job-postings/{backendId}/publish/
export async function publishJobPosting(backendId) {
  const res = await authFetch(`${API_URL}${backendId}/publish/`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to publish job posting (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return normalizeJobPosting(data);
}

// POST /api/job-postings/{backendId}/unpublish/
export async function unpublishJobPosting(backendId) {
  const res = await authFetch(`${API_URL}${backendId}/unpublish/`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to unpublish job posting (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return normalizeJobPosting(data);
}

// DELETE /api/job-postings/{backendId}/
export async function deleteJobPosting(backendId) {
  const res = await authFetch(`${API_URL}${backendId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete job posting (${res.status}): ${errText}`);
  }
}
