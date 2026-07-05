// Role Requests API client.
// Mirrors the pattern used in jobRequestsApi.js.
import { apiRequest } from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/role-requests/`;

/**
 * Map one API record → the shape RoleRequests.jsx expects.
 *
 * Backend fields   → UI fields
 * department       → dept
 * role             → role
 * justification    → just
 * status           → status
 * date             → date
 * request_id       → id   (also kept as backendId for numeric pk)
 */
export const normalizeRoleRequest = (r) => ({
  id: r.request_id || String(r.id),   // human-readable ID shown in the table
  backendId: r.id,                    // numeric pk, used for future PATCH/DELETE
  dept: r.department || "",
  role: r.role || "",
  just: r.justification || "",
  status: r.status || "Pending",
  date: r.date || new Date().toLocaleDateString(),
  submittedBy: r.created_by_name || r.submitted_by || "",
  // Fields that exist on the backend model but are optional in the UI
  experience: "",
  salaryRange: "",
  category: "",
  history: [],
  requestType: "Role",
});

/**
 * GET /api/role-requests/
 * Returns a normalized array of all role requests.
 */
export async function fetchRoleRequests() {
  const res = await apiRequest(API_URL);

  if (!res.ok) {
    throw new Error(`Failed to load role requests (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeRoleRequest);
}

/**
 * POST /api/role-requests/
 * Creates a new role request and returns the normalized record.
 *
 * formData shape expected from RoleRequests.jsx emptyForm():
 *   { dept, role, just, ... }
 */
export async function createRoleRequest(formData, submittedBy) {
  // Map UI field names → backend field names
  const payload = {
    department: formData.dept,
    role: formData.role,
    justification: formData.just,
    submitted_by: submittedBy,
  };

  const res = await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return normalizeRoleRequest(data);
}

