// Interviews API client.
// Uses the access token from .env (no login flow yet), mirroring jobRequestsApi.js.
//
// Field mapping (frontend <-> backend):
//   candidate  <-> candidate_name
//   time       <-> time        ("2:00 PM"  <-> "14:00:00")
//   mode       <-> mode        ("In-Person" <-> "Offline", "Online" <-> "Online")
//   meetingLink<-> meeting_link
//   panel      <-> panel (write: list of panelist ids; read: panel_details objects)
//
// The interview's top-level `score` / `recommendation` / `feedback` are NOT mapped
// here — they're legacy, superseded by per-panelist evaluations (`evaluations[]` /
// `panelist_evaluation`, via normalizeEvaluation / submitPanelistEvaluation below).
// normalizeInterview always returns fixed defaults for score/rec/remarks regardless
// of what the API sends, and buildInterviewPayload never sends them back.
//
// date/time/panel are all optional on the backend, so a round can be created with
// just candidate_name + role (no schedule yet) and filled in later via PATCH.

import { authHeaders, authFetch, getAccessToken, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/interviews/`;

// "2:00 PM" / "9:00 AM" -> "14:00:00" / "09:00:00" (passes through 24h values).
export const toApiTime = (t) => {
  if (!t) return t;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) {
    // already 24h ("14:00" or "14:00:00")
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m}:00`;
  }
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}:00`;
};

// "14:00:00" -> "2:00 PM" (matches the TIME_OPTIONS values used by the schedule form).
export const toDisplayTime = (t) => {
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t;
  const h = parseInt(m[1], 10);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m[2]} ${ap}`;
};

const toApiMode = (m) => (m === "Online" ? "Online" : "Offline");
const toDisplayMode = (m) => (m === "Online" ? "Online" : "In-Person");

// The backend validates `criteria` to contain exactly these keys — anything else
// must go in `custom_criteria`. The evaluation form shows these as the default
// rows, plus whatever rows the panelist adds via "Add custom field".
export const CORE_CRITERIA = [
  "Communication Skills",
  "Subject Knowledge",
  "Confidence",
  "Problem Solving",
  "Cultural Fit",
];

// The form works with ONE flat { criterionName: score } object — the caller never
// has to know which rows are "core" vs "custom". This splits it the way the API
// requires right before sending.
const splitCriteria = (flat = {}) => {
  const criteria = {};
  const custom_criteria = {};
  Object.entries(flat).forEach(([key, value]) => {
    if (CORE_CRITERIA.includes(key)) criteria[key] = value;
    else custom_criteria[key] = value;
  });
  return { criteria, custom_criteria };
};

// Map one panelist evaluation record -> a flat shape for the UI (merges criteria +
// custom_criteria back into one object, mirroring how the form edits them).
export const normalizeEvaluation = (e) => ({
  id: e.id,
  panelistId: e.panelist,
  criteria: { ...(e.criteria || {}), ...(e.custom_criteria || {}) },
  overallScore: e.overall_score ?? null,
  rec: e.recommendation || "—",
  notes: e.notes || "",
  submittedAt: e.submitted_at || null,
});

// Map one API record -> the shape the Interview Panel screen expects.
// The backend now has a real "Pending" status; fall back to date presence only
// if status is somehow missing.
export const normalizeInterview = (r) => ({
  backendId: r.id,
  id: r.interview_id || `INT-${r.id}`,
  applicationId: r.application ?? null,
  candidate: r.candidate_name || "",
  role: r.role || "",
  date: r.date || "",
  time: toDisplayTime(r.time),
  panel: Array.isArray(r.panel_details) ? r.panel_details.map((p) => p.name) : [],
  panelDetails: Array.isArray(r.panel_details) ? r.panel_details : [],
  // Legacy top-level fields — intentionally NOT read from the API (see file header).
  // Fixed defaults keep existing `i.score !== null` / `i.rec !== "—"` checks safe.
  score: null,
  rec: "—",
  remarks: "",
  status: r.status || (r.date ? "Scheduled" : "Pending"),
  mode: toDisplayMode(r.mode),
  meetingLink: r.meeting_link || "",
  round: r.round ?? 1,
  reminderSentAt: r.reminder_sent_at || null,
  evaluations: Array.isArray(r.evaluations) ? r.evaluations.map(normalizeEvaluation) : [],
  evaluationSummary: r.evaluation_summary || null, // { assigned_count, submitted_count, average_score }
  candidatePresent: r.candidate_present !== undefined ? r.candidate_present : null,
});

// Build a backend payload from frontend fields. Only keys that are provided are
// included, so this works for both POST (create) and PATCH (partial update).
export const buildInterviewPayload = (fi) => {
  const p = {};
  if (fi.candidate !== undefined) p.candidate_name = fi.candidate;
  if (fi.role !== undefined) p.role = fi.role;
  if (fi.date !== undefined) p.date = fi.date || null;
  if (fi.time !== undefined) p.time = fi.time ? toApiTime(fi.time) : null;
  if (fi.mode !== undefined) p.mode = toApiMode(fi.mode);
  if (fi.meetingLink !== undefined) p.meeting_link = fi.meetingLink || "";
  if (fi.round !== undefined) p.round = fi.round;
  if (fi.status !== undefined) p.status = fi.status;
  // score / rec / remarks intentionally never sent — legacy top-level fields,
  // ignored in favor of per-panelist evaluations (see file header).
  if (fi.reminderSentAt !== undefined) p.reminder_sent_at = fi.reminderSentAt;
  if (fi.panelIds !== undefined) p.panel = fi.panelIds;
  if (fi.candidatePresent !== undefined) p.candidate_present = fi.candidatePresent;
  if (fi.applicationId !== undefined) p.application = fi.applicationId;
  return p;
};

// GET /api/interviews/ -> normalized array.
export async function fetchInterviews() {
  const res = await authFetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load interviews (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeInterview);
}

// GET /api/interviews/upcoming/ -> normalized array of upcoming interviews only
// (backend filters to status="Scheduled" AND date >= today). Candidates get their
// own; HR/admin/panelist users get all upcoming ones. Callers that need to scope a
// panelist to their own interviews should filter the result by panel membership.
export async function fetchUpcomingInterviews() {
  const res = await authFetch(`${API_URL}upcoming/`, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load upcoming interviews (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeInterview);
}

// POST /api/interviews/ -> normalized record. `payload` must already be a backend
// payload (build it with buildInterviewPayload). Only candidate_name + role are
// required by the API — a round can be created before it's scheduled.
export async function createInterview(payload) {
  if (!getAccessToken()) throw new Error("Not authenticated — please log in.");

  const res = await authFetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  return normalizeInterview(await res.json());
}

// Build the `panelist_evaluation` payload for PATCH /api/interviews/{id}/.
// `criteria` is ONE flat object with both core and custom rows — this splits it
// into `criteria`/`custom_criteria` the way the API requires.
export const buildPanelistEvaluationPayload = ({ panelistId, criteria, rec, notes }) => {
  const { criteria: coreCriteria, custom_criteria } = splitCriteria(criteria);
  return {
    panelist_evaluation: {
      panelist: panelistId,
      criteria: coreCriteria,
      custom_criteria,
      recommendation: rec === "—" ? "" : rec,
      notes: notes || "",
    },
  };
};

// PATCH /api/interviews/{backendId}/ with a single panelist's evaluation
// (criteria/custom_criteria/recommendation/notes) -> normalized interview record,
// including the updated `evaluations[]` and `evaluationSummary`.
export async function submitPanelistEvaluation(backendId, { panelistId, criteria, rec, notes }) {
  return updateInterview(backendId, buildPanelistEvaluationPayload({ panelistId, criteria, rec, notes }));
}

// PATCH /api/interviews/{backendId}/ -> normalized record.
export async function updateInterview(backendId, payload) {
  if (!getAccessToken()) throw new Error("Not authenticated — please log in.");

  const res = await authFetch(`${API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  return normalizeInterview(await res.json());
}

// DELETE /api/interviews/{backendId}/
export async function deleteInterview(backendId) {
  const res = await authFetch(`${API_URL}${backendId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete interview (${res.status}): ${errText}`);
  }
}

// POST /api/interviews/{backendId}/remind/ -> triggers reminder emails
export async function triggerInterviewReminder(backendId) {
  if (!getAccessToken()) throw new Error("Not authenticated — please log in.");

  const res = await authFetch(`${API_URL}${backendId}/remind/`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  return normalizeInterview(await res.json());
}

