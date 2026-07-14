// Existing Roles API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/roles/`;

// Map one API record -> the shape the ExistingRoles screen expects.
export const normalizeRole = (r) => ({
  id: r.role_id || String(r.id),  // human id shown in the table (e.g. "ROL-2026-0001")
  backendId: r.id,                // numeric pk, kept for future PATCH/DELETE
  dept: r.department || "",
  role: r.role || "",
  type: r.type || "",
  category: r.category || "",
  experience: r.experience || "",
  salaryRange: r.salary_range || "",
  headcount: r.headcount ?? 0,
  filled: r.filled ?? 0,
  currentFilled: r.filled ?? 0,
  status: r.status || "Active",
  currentStatus: r.status || "Active",
});

// GET /api/roles/ -> normalized array.
export async function fetchRoles() {
  const res = await fetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load roles (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeRole);
}

// PATCH /api/roles/{backendId}/ — partial update (e.g. status toggle).
export async function patchRole(backendId, payload) {
  const res = await fetch(`${API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update role (${res.status}): ${errText}`);
  }

  return normalizeRole(await res.json());
}

// DELETE /api/roles/{backendId}/
export async function deleteRole(backendId) {
  const res = await fetch(`${API_URL}${backendId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete role (${res.status}): ${errText}`);
  }
}
