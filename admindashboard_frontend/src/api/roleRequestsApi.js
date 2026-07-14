// Role Requests API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/role-requests/`;

// Map one API record -> the shape the RoleRequests screen expects.
export const normalizeRoleRequest = (r) => ({
  id: r.request_id || String(r.id),   // human id shown in the table
  backendId: r.id,                    // numeric pk, kept for future PATCH/DELETE
  dept: r.department || "",
  role: r.role || "",
  type: r.type || "",
  category: r.category || "",
  experience: r.experience || "",
  salaryRange: r.salary_range || "",
  just: r.justification || "",
  status: r.status || "Pending",
  submittedBy: r.submitted_by || "",
  date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
  history: Array.isArray(r.history) ? r.history : [],
});

// DRF validation errors come back as { field: ["message", ...], ... }; flatten to one readable string.
const parseErrorResponse = async (res) => {
  try {
    const errData = await res.json();
    if (errData && typeof errData === "object") {
      const parts = Object.entries(errData).map(
        ([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
      );
      if (parts.length) return parts.join(" | ");
    }
  } catch {
    // response wasn't JSON; fall back to the generic message below
  }
  return `API Error: ${res.status} ${res.statusText}`;
};

// GET /api/role-requests/ -> normalized array.
export async function fetchRoleRequests() {
  const res = await fetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load role requests (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeRoleRequest);
}

// POST /api/role-requests/
export async function createRoleRequest(formData, submittedBy) {
  const payload = {
    department: formData.dept,
    role: formData.role,
    type: formData.type,
    justification: formData.just,
    salary_range: formData.salaryRange,
    experience: formData.experience,
    submitted_by: submittedBy,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await res.json();
  return normalizeRoleRequest(data);
}

// PATCH /api/role-requests/{backendId}/ — partial update (edit fields and/or status).
export async function updateRoleRequest(backendId, payload) {
  const res = await fetch(`${API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await res.json();
  return normalizeRoleRequest(data);
}
