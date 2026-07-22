// Job Requests API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, authFetch, getAccessToken, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/job-requests/`;

// Backend returns skills as a comma- or newline-separated string; the UI wants an array.
const toSkillsArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return String(val)
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

// Map one API record -> the shape the table / cards / modal expect.
export const normalizeJobRequest = (r) => ({
  id: r.request_id || String(r.id),      // human id shown in the table (e.g. "JR-2026-0006")
  backendId: r.id,                       // numeric pk, kept for future PATCH/DELETE
  role: r.role || "",
  existing_role: r.existing_role || null,
  location: r.location || "",
  vacancies: r.vacancies ?? "",
  exp: r.experience || "",
  qual: toSkillsArray(r.educational_qualifications || r.qualification || ""), // backend is a comma-separated educational_qualifications string
  type: r.type || "",
  salary: r.salary_range || "",
  status: r.status || "Pending",
  department: r.department || "",
  category: (r.category || "").replace(/\s*Positions$/, ""),
  description: r.description || "",
  justification: r.justification || "",
  skills: toSkillsArray(r.skills_required),
  history: Array.isArray(r.history) ? r.history : [],
  submittedBy: r.submitted_by || "",
  date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
});

// GET /api/job-requests/ -> normalized array.
export async function fetchJobRequests() {
  const res = await authFetch(API_URL, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load job requests (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeJobRequest);
}

// Map frontend form data (using UI keys like qual, exp, etc.) to backend API payload keys.
const buildJobRequestPayload = (formData) => ({
  role: formData.role,
  existing_role: formData.existing_role || null,
  vacancies: parseInt(formData.vacancies) || 1,
  experience: formData.exp,
  salary_range: formData.salary,
  type: formData.type,
  educational_qualifications: (formData.qual || []).join(", "), // Backend field name — stored as a single comma-separated string
  department: formData.department,
  category: formData.category ? (formData.category.endsWith("Positions") ? formData.category : `${formData.category} Positions`) : "",
  location: formData.location,
  description: formData.description,
  justification: formData.justification,
  skills_required: (formData.skills || []).join(", "), // Backend expects comma-separated string
});

// POST /api/job-requests/
export async function createJobRequest(formData, submittedBy) {
  if (!getAccessToken()) {
    throw new Error("Not authenticated — please log in.");
  }

  const payload = { ...buildJobRequestPayload(formData), submitted_by: submittedBy };

  const res = await authFetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return normalizeJobRequest(data);
}

// PATCH /api/job-requests/{backendId}/
export async function updateJobRequestStatus(backendId, status) {
  if (!getAccessToken()) {
    throw new Error("Not authenticated — please log in.");
  }

  const res = await authFetch(`${API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return normalizeJobRequest(data);
}

// PATCH /api/job-requests/{backendId}/ — persists edited fields (department, role,
// salary, etc). `takeApprovalAction` only sends the action verb + note, so field
// edits made in the Approval Requests modal must be saved here separately.
export async function updateJobRequestFields(backendId, formData) {
  if (!getAccessToken()) {
    throw new Error("Not authenticated — please log in.");
  }

  const res = await authFetch(`${API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(buildJobRequestPayload(formData)),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return normalizeJobRequest(data);
}

