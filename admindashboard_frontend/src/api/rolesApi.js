// Existing Roles API client.
// Uses the access token from .env (no login flow yet), mirroring jobRequestsApi.js.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/roles/`;
const ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
});

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
