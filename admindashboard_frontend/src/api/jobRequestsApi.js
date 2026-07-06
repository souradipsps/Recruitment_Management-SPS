// Job Requests API client.
import { apiRequest } from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
  location: r.location || "",
  vacancies: r.vacancies ?? "",
  exp: r.experience || "",
  qual: r.educational_qualifications || r.qualification || "", // backend is educational_qualifications
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
  const res = await apiRequest(API_URL);

  if (!res.ok) {
    throw new Error(`Failed to load job requests (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeJobRequest);
}

// POST /api/job-requests/
export async function createJobRequest(formData, submittedBy) {
  // Map frontend form data (using UI keys like qual, exp, etc.) to backend API payload keys
  const payload = {
    role: formData.role,
    vacancies: parseInt(formData.vacancies) || 1,
    experience: formData.exp,
    salary_range: formData.salary,
    type: formData.type,
    educational_qualifications: formData.qual, // Backend field name
    department: formData.department,
    category: formData.category ? (formData.category.endsWith("Positions") ? formData.category : `${formData.category} Positions`) : "",
    location: formData.location,
    description: formData.description,
    justification: formData.justification,
    skills_required: (formData.skills || []).join(", "), // Backend expects comma-separated string
    submitted_by: submittedBy,
  };

  const res = await apiRequest(API_URL, {
    method: "POST",
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
  const res = await apiRequest(`${API_URL}${backendId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return normalizeJobRequest(data);
}

