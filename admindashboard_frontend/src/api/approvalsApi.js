// Approvals API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/approvals/`;

// UI status label -> backend action verb expected by POST /approvals/{id}/action/.
const ACTION_VERB = {
  Approved: "Approve",
  Rejected: "Reject",
  "Sent Back": "Send Back",
};

// Backend history entry {action, acted_by, date, note} -> UI shape {act, by, date, note}.
const toHistory = (list) =>
  (Array.isArray(list) ? list : []).map((h) => ({
    act: h.action || "",
    by: h.acted_by || "",
    date: h.date || "",
    note: h.note || "",
  }));

// Backend returns skills as a comma/newline-separated string; the UI wants an array.
const toSkillsArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return String(val).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
};

// Map one API record -> the shape the ApprovalRequests screen expects.
export const normalizeApproval = (r) => ({
  id: r.request_id || String(r.id), // key used across local state (matches sourceId of role/job requests)
  backendId: r.id,                  // numeric pk, used for the action endpoint
  sourceId: r.source_request_id || r.request_id || String(r.id),
  sourceDbId: r.source_db_id ?? r.job_request ?? r.role_request ?? null, // numeric pk of the underlying Job/Role Request row
  type: r.type || "",
  role: r.title || "",
  dept: r.department || "",
  requestedBy: r.submitted_by || "",
  date: r.date || "",
  status: r.status || "Pending",
  salary: r.salary_range || "",
  experience: r.experience || "",
  vacancies: r.vacancies ?? "",
  qual: r.educational_qualifications || "",
  empType: r.employment_type || "",
  location: r.location || "",
  category: (r.category || "").replace(/\s*Positions$/, ""),
  description: r.description || "",
  skills: toSkillsArray(r.skills_required),
  comment: "",
  just: r.justification || "",
  history: toHistory(r.history),
});

// GET /api/approvals/ -> normalized array.
export async function fetchApprovals() {
  const res = await fetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load approvals (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeApproval);
}

// POST /api/approvals/{id}/action/. `status` is the UI label ("Approved" | "Rejected" | "Sent Back").
export async function takeApprovalAction(backendId, status, note = "", actedBy = "HR Admin") {
  const action = ACTION_VERB[status];
  if (!action) {
    throw new Error(`Unsupported approval status: ${status}`);
  }

  const res = await fetch(`${API_URL}${backendId}/action/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ action, note, acted_by: actedBy }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }
}
