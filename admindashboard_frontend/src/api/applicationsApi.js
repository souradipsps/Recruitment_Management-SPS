// Applications API client — job-posting applications (GET /applications/,
// PATCH /applications/{id}/update_status/) and general applications
// (GET /general-applications/, PATCH /general-applications/{id}/).
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, authFetch, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/applications/`;
const GENERAL_API_URL = `${API_BASE_URL}/general-applications/`;
const INTERVIEWS_URL = `${API_BASE_URL}/interviews/`;

// Map one API record -> the shape the Applications screen expects.
// The live API returns richer data than documented — candidate contact info,
// experience, qualification, referral, and resume are all present on the
// response and used directly rather than placeheld.
export const normalizeApplication = (r) => ({
  id: r.app_id || String(r.id),
  backendId: r.id,
  name: r.candidate_name || "",
  role: r.role || "",
  jobPostingId: r.posting ?? null,
  status: r.status || "Applied",
  applied: r.applied_date || "",
  email: r.candidate_email || "—",
  exp: r.experience || "—",
  qualification: r.qualification || "—",
  referredBy: r.has_referral ? (r.referral_emp_id || r.referred_by || "—") : "—",
  phone: r.candidate_phone || "—",
  resume: r.resume || null,
  candidateId: r.candidate ?? null,  // Candidate model FK, threaded through to offer creation
});

// GET /api/applications/ -> normalized array (admin: all job-posting applications).
export async function fetchApplications(page = 1, pageSize = 20, paginate = false, search = "", status = "", posting = "") {
  const params = new URLSearchParams();
  if (paginate) {
    params.append("paginate", "true");
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
  }
  if (search) params.append("search", search);
  if (status && status !== "All") params.append("status", status);
  if (posting) params.append("posting", String(posting));

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await authFetch(`${API_URL}${queryString}`, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load applications (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  if (paginate) {
    return {
      results: (data.results || []).map(normalizeApplication),
      count: data.count || 0
    };
  }
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeApplication);
}

// PATCH /api/applications/{backendId}/update_status/
export async function updateApplicationStatus(backendId, status, adminNote = "") {
  const res = await authFetch(`${API_URL}${backendId}/update_status/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status, ...(adminNote ? { admin_note: adminNote } : {}) }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update application status (${res.status}): ${errText}`);
  }

  return res.json();
}

// Backend TimeField ("HH:MM:SS") -> the label format InterviewPanel's TIME_OPTIONS uses ("9:00 AM").
const toFrontendTime = (val) => {
  if (!val) return "";
  const [hStr, mStr] = val.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};

// Backend MODE_CHOICES ("Online"/"Offline") -> InterviewPanel's MODE_OPTIONS ("Online"/"In-Person").
const toFrontendMode = (mode) => (mode === "Online" ? "Online" : "In-Person");

// Map one API interview record -> the shape InterviewPanel.jsx expects (same shape as the
// old local INTERVIEWS mock: candidate, role, date, time, panel, score, rec, status, mode,
// meetingLink, round).
export const normalizeInterview = (r) => ({
  id: r.interview_id || String(r.id),
  backendId: r.id,
  applicationId: r.application ?? null,
  candidate: r.candidate_name || "",
  role: r.role || "",
  date: r.date || "",
  time: toFrontendTime(r.time),
  panel: (r.panel_details || []).map((p) => p.name),
  score: r.score ?? null,
  rec: r.recommendation || "—",
  status: r.status || "Pending",
  mode: toFrontendMode(r.mode),
  meetingLink: r.meeting_link || "",
  round: r.round || 1,
});

// GET /api/interviews/ -> normalized array. Interview Panel loads its list from here so it
// always reflects the real database instead of local/mock state.
export async function fetchInterviews() {
  const res = await fetch(INTERVIEWS_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load interviews (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeInterview);
}

// POST /api/interviews/ — create the Round 1 interview record when a candidate is
// shortlisted, so Interview Panel shows them as "Pending" right away.
// applicationId is only set for job-posting applications (general applications have
// no JobApplication row to link against).
export async function createShortlistInterview({ candidate, role, applicationId = null }) {
  const res = await fetch(INTERVIEWS_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      candidate_name: candidate,
      role,
      round: 1,
      application: applicationId,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create interview record (${res.status}): ${errText}`);
  }

  return normalizeInterview(await res.json());
}

// DELETE /api/interviews/{backendId}/ — remove the interview record when a candidate
// is rejected.
export async function deleteInterview(backendId) {
  const res = await fetch(`${INTERVIEWS_URL}${backendId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to remove interview record (${res.status}): ${errText}`);
  }
}

// Map one general-application API record -> the shape the Applications screen expects.
export const normalizeGeneralApplication = (r) => ({
  id: r.app_id || String(r.id),
  backendId: r.id,
  name: r.candidate_name || "",
  preferredRole: r.preferred_role || "",
  location: r.location || "",
  status: r.status || "Applied",
  applied: r.applied_date || "",
  email: r.candidate_email || "—",
  exp: r.experience || "—",
  qualification: r.qualification || "—",
  phone: r.candidate_phone || "—",
  resume: r.resume || null,
  candidateId: r.candidate ?? null,  // Candidate model FK, threaded through to offer creation
});

// GET /api/general-applications/ -> normalized array (admin: all general/profile applications).
export async function fetchGeneralApplications(page = 1, pageSize = 20, paginate = false, search = "", status = "") {
  const params = new URLSearchParams();
  if (paginate) {
    params.append("paginate", "true");
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
  }
  if (search) params.append("search", search);
  if (status && status !== "All") params.append("status", status);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await authFetch(`${GENERAL_API_URL}${queryString}`, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load general applications (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  if (paginate) {
    return {
      results: (data.results || []).map(normalizeGeneralApplication),
      count: data.count || 0
    };
  }
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeGeneralApplication);
}

// PATCH /api/general-applications/{backendId}/ — no dedicated update_status action,
// so this uses the ModelViewSet's partial_update (HR Admin only).
export async function updateGeneralApplicationStatus(backendId, status, adminNote = "") {
  const res = await authFetch(`${GENERAL_API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status, ...(adminNote ? { admin_note: adminNote } : {}) }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update general application status (${res.status}): ${errText}`);
  }

  return res.json();
}
