// Interviews + Panelists API client.
// Uses the access token from .env (no login flow yet), mirroring jobRequestsApi.js.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PANELISTS_URL = `${API_BASE_URL}/panelists/`;
const INTERVIEWS_URL = `${API_BASE_URL}/interviews/`;
const ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
});

// ── Panelists ───────────────────────────────────────────────────────────

// Map one API record -> the shape the InterviewPanel screen expects.
export const normalizePanelist = (r) => ({
  id: r.id,
  name: r.name || "",
  email: r.email || "",
  phone: r.phone || "",
  department: r.department || "",
  isActive: r.is_active !== false,
});

// GET /api/panelists/ -> normalized array.
export async function fetchPanelists() {
  const res = await fetch(PANELISTS_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load panelists (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizePanelist);
}

// POST /api/panelists/
export async function createPanelist({ name, email, phone, department = "" }) {
  const res = await fetch(PANELISTS_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, email, phone, department }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to add panelist (${res.status}): ${errText}`);
  }

  return normalizePanelist(await res.json());
}

// DELETE /api/panelists/{id}/ — backend does a soft delete (is_active = false).
export async function deletePanelist(id) {
  const res = await fetch(`${PANELISTS_URL}${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to remove panelist (${res.status}): ${errText}`);
  }
}

// ── Interviews ──────────────────────────────────────────────────────────

// Backend TimeField ("HH:MM:SS") -> UI label used by the TIME_OPTIONS select ("9:00 AM").
const toFrontendTime = (val) => {
  if (!val) return "";
  const [hStr, mStr] = val.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};

// UI time label ("9:00 AM") -> backend TimeField ("09:00:00").
const toBackendTime = (val) => {
  if (!val) return null;
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(val.trim());
  if (!match) return val; // already in 24h form, or unrecognized — pass through
  let [, h, m, suffix] = match;
  h = parseInt(h, 10);
  if (suffix.toUpperCase() === "PM" && h !== 12) h += 12;
  if (suffix.toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}:00`;
};

// Backend MODE_CHOICES ("Online"/"Offline") -> UI MODE_OPTIONS ("Online"/"In-Person").
const toFrontendMode = (mode) => (mode === "Online" ? "Online" : "In-Person");
// UI MODE_OPTIONS -> backend MODE_CHOICES.
const toBackendMode = (mode) => (mode === "Online" ? "Online" : "Offline");

// Map one API record -> the shape InterviewPanel.jsx / Panelist.jsx expect.
export const normalizeInterview = (r) => ({
  id: r.interview_id || String(r.id),
  backendId: r.id,
  applicationId: r.application ?? null,
  candidate: r.candidate_name || "",
  role: r.role || "",
  date: r.date || "",
  time: toFrontendTime(r.time),
  panel: (r.panel_details || []).map((p) => p.name),
  panelIds: (r.panel_details || []).map((p) => p.id),
  score: r.score ?? null,
  rec: r.recommendation || "—",
  status: r.status || "Pending",
  mode: toFrontendMode(r.mode),
  meetingLink: r.meeting_link || "",
  round: r.round || 1,
  remarks: r.feedback || "",
  reminderSentAt: r.reminder_sent_at || undefined,
  candidatePresent: r.candidate_present ?? null,
  evaluations: Array.isArray(r.evaluations) ? r.evaluations : [],
});

// GET /api/interviews/ -> normalized array.
export async function fetchInterviews() {
  const res = await fetch(INTERVIEWS_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load interviews (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeInterview);
}

// Map frontend-shaped fields (only the keys present are translated) -> backend payload keys.
const toBackendFields = (fields) => {
  const out = {};
  if ("candidate" in fields) out.candidate_name = fields.candidate;
  if ("role" in fields) out.role = fields.role;
  if ("date" in fields) out.date = fields.date || null;
  if ("time" in fields) out.time = fields.time ? toBackendTime(fields.time) : null;
  if ("mode" in fields) out.mode = toBackendMode(fields.mode);
  if ("meetingLink" in fields) out.meeting_link = fields.meetingLink || "";
  if ("round" in fields) out.round = fields.round;
  if ("panelIds" in fields) out.panel = fields.panelIds;
  if ("applicationId" in fields) out.application = fields.applicationId;
  if ("candidatePresent" in fields) out.candidate_present = fields.candidatePresent;
  return out;
};

// POST /api/interviews/ — fields: candidate, role, date?, time?, mode?, meetingLink?, round, panelIds?, applicationId?
export async function createInterview(fields) {
  const res = await fetch(INTERVIEWS_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ round: 1, mode: "In-Person", ...toBackendFields(fields) }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create interview (${res.status}): ${errText}`);
  }

  return normalizeInterview(await res.json());
}

// PATCH /api/interviews/{backendId}/ — partial update, only supplied fields are sent.
export async function updateInterview(backendId, fields) {
  const res = await fetch(`${INTERVIEWS_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(toBackendFields(fields)),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update interview (${res.status}): ${errText}`);
  }

  return normalizeInterview(await res.json());
}

// PATCH /api/interviews/{backendId}/score/ — { score, recommendation, feedback, status }
export async function submitInterviewScore(backendId, scoreData) {
  const res = await fetch(`${INTERVIEWS_URL}${backendId}/score/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(scoreData),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to submit score (${res.status}): ${errText}`);
  }

  return normalizeInterview(await res.json());
}
