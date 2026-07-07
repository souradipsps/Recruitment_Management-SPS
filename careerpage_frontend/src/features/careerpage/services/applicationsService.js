// Network layer for candidate job applications (POST /applications/, GET
// /applications/mine/). Mirrors the style of ./authService.js and
// ./jobsService.js in this folder.

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Turn a Django REST Framework error body into one readable sentence.
function parseApiError(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  if (typeof body.detail === "string") return body.detail;
  const firstKey = Object.keys(body)[0];
  if (!firstKey) return fallback;
  const val = body[firstKey];
  const msg = Array.isArray(val) ? val[0] : val;
  return typeof msg === "string" ? msg : fallback;
}

async function readErrorMessage(res, fallback) {
  if (res.status === 401) return "Your session has expired. Please log in again.";
  if (res.status === 403) return "You do not have permission to perform this action.";
  const body = await res.json().catch(() => null);
  return parseApiError(body, fallback);
}

/**
 * Submit a job application for a specific published posting.
 * POST /api/applications/
 * @param {{ postingId: number, experience: string, qualification: string, coverLetter?: string, noticePeriod?: string, hasReferral?: boolean }} data
 * @returns {Promise<object>} the created application record
 */
export async function submitApplication({ postingId, experience, qualification, coverLetter, noticePeriod, hasReferral }) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/applications/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        posting: postingId,
        experience,
        qualification,
        cover_letter: coverLetter ?? "",
        notice_period: noticePeriod ?? "",
        has_referral: !!hasReferral,
      }),
    });
  } catch {
    throw new Error("Network error. Please check your connection and try again.");
  }

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not submit your application. Please try again."));
  }

  return res.json();
}

// Map one raw "mine" record onto the shape the dashboard components expect.
function normalizeMyApplication(raw) {
  return {
    backendId: raw.id,
    appId: raw.app_id ?? null,
    postingId: raw.posting,
    title: raw.posting_title || raw.role || "Untitled Position",
    status: raw.status || "Applied",
    appliedDate: raw.applied_date || null,
  };
}

/**
 * Fetch all applications submitted by the currently logged-in candidate.
 * GET /api/applications/mine/
 * @returns {Promise<Array>} normalised application records
 */
export async function fetchMyApplications() {
  let res;
  try {
    res = await fetch(`${BASE_URL}/applications/mine/`, { headers: authHeaders() });
  } catch {
    throw new Error("Network error. Please check your connection and try again.");
  }

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Failed to load your applications (HTTP ${res.status}).`));
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data?.results ?? [];
  return list.map(normalizeMyApplication);
}
