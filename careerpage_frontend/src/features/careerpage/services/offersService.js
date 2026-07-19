// Network layer for the candidate's own offer letter(s) and the OnboardingRecord
// that accepting one auto-creates.
//
// GET   /api/offers/                 -> candidate sees only their own offers
// POST  /api/offers/{id}/accept/     -> accept (auto-creates an OnboardingRecord)
// POST  /api/offers/{id}/decline/    -> decline
// GET   /api/onboarding/             -> candidate sees only their own onboarding record(s)
// PATCH /api/onboarding/{id}/        -> submit identity/bank details + document uploads
//
// The raw API shape does NOT match what OfferLetterCard renders, so it is
// normalised here once — same approach as ./jobsService.js / ./interviewsService.js.

import { parseApiError } from "./authService";

// Base URL comes solely from the environment (.env → VITE_API_BASE_URL), same
// as ./authService.js and the other services.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

function requireAuthToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("You must be logged in to view your offer. Please log in and try again.");
  return token;
}

// "2026-07-25" -> "July 25, 2026". Falls back to the raw value if unparseable.
function formatDate(raw) {
  if (!raw) return "";
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Turn a possibly-relative offer_letter path into an absolute URL the browser
// can open directly (the API serves media under its own origin).
function absoluteUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  try {
    return `${new URL(BASE_URL).origin}${path}`;
  } catch {
    return path;
  }
}

// Map one raw API offer record onto the shape OfferLetterCard understands.
export function normalizeOffer(raw) {
  return {
    backendId: raw.id,
    offerId: raw.offer_id || `OFR-${raw.id}`,
    candidateName: raw.candidate_name || "",
    role: raw.role || "",
    department: raw.department || "",
    salary: raw.ctc || "",
    issuedDate: formatDate(raw.issued_date),
    expiryDate: formatDate(raw.expiry_date),
    joiningDate: formatDate(raw.joining_date),
    // "Draft" | "Sent" | "Accepted" | "Rejected"
    status: raw.status || "Sent",
    offerLetterUrl: absoluteUrl(raw.offer_letter),
  };
}

/**
 * Fetch the current candidate's offers, already normalised, newest first.
 * GET /api/offers/
 * @returns {Promise<Array>} normalised offer objects
 * @throws {Error} on network / non-2xx responses
 */
export async function fetchMyOffers() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/offers/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not load your offer."));
  }
  // Endpoint returns a bare array; tolerate a paginated { results: [...] } too.
  const list = Array.isArray(data) ? data : data?.results ?? [];
  return list
    .map(normalizeOffer)
    // Candidates shouldn't act on drafts (the API only sends "Sent" once it's
    // released, but guard anyway), and newest offer first.
    .filter((o) => o.status !== "Draft")
    .sort((a, b) => b.backendId - a.backendId);
}

/**
 * Accept an offer. Auto-creates the OnboardingRecord server-side.
 * POST /api/offers/{id}/accept/
 * @param {number} id offer backend id
 * @returns {Promise<object>} the updated, normalised offer (status "Accepted")
 */
export async function acceptOffer(id) {
  return offerAction(id, "accept", "Could not accept the offer. Please try again.");
}

/**
 * Decline an offer.
 * POST /api/offers/{id}/decline/
 * @param {number} id offer backend id
 * @returns {Promise<object>} the updated, normalised offer (status "Rejected")
 */
export async function declineOffer(id) {
  return offerAction(id, "decline", "Could not decline the offer. Please try again.");
}

async function offerAction(id, action, fallbackMsg) {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/offers/${id}/${action}/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, fallbackMsg));
  }
  return normalizeOffer(data);
}

// verified_docs / rejected_docs are stored on the backend as a JSON-encoded
// string (e.g. '["aadhar","pan"]'), not a real JSON field — parse defensively.
function parseDocList(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Same doc-key <-> backend-file-field mapping used to build the upload FormData
// in CandidateDashboard.jsx's handleSubmitDocs.
const DOC_KEY_TO_BACKEND_FIELD = {
  aadhar: "aadhar_card",
  pan: "pan_card",
  bank_details: "bank_passbook",
  photo: "passport_photo",
  driving_license: "driving_license",
  class10: "class10_marksheet",
  class12: "class12_marksheet",
  degree: "degree_certificate",
  experience_cert: "experience_certificate",
  prof_cert: "professional_certificate",
};

// "https://.../onboarding/aadhar/2026/e-Aadhar_UORE6zD.pdf" -> "e-Aadhar_UORE6zD.pdf"
function filenameFromUrl(url) {
  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url;
  }
}

// Map one raw OnboardingRecord onto the bit the onboarding-documents UI needs.
// This is read by both the document-upload form and the progress stepper, so
// it stays in sync with whatever HR has actually verified in the admin dashboard.
// Also carries the *actual* uploaded files/identity fields — the upload form
// seeds its local state from these on load, instead of relying on whatever was
// picked in the current browser session (which is empty after a page refresh).
function normalizeOnboardingRecord(raw) {
  const verifiedDocs = parseDocList(raw.verified_docs);
  const rejectedDocs = parseDocList(raw.rejected_docs);
  // Per-document badge ("verified" | "rejected") for every document key the
  // admin dashboard can act on — the 4 compulsory ones plus the 6 optional
  // ones (same keys as RequiredDocumentsCard.jsx's COMPULSORY_DOCS/OPTIONAL_DOCS).
  const docStatus = {};
  const uploadedDocNames = {};
  const uploadedDocUrls = {};
  Object.entries(DOC_KEY_TO_BACKEND_FIELD).forEach(([key, field]) => {
    const url = raw[field];
    if (url) {
      uploadedDocUrls[key] = absoluteUrl(url);
      uploadedDocNames[key] = filenameFromUrl(url);
    }
    if (verifiedDocs.includes(key)) docStatus[key] = "verified";
    else if (rejectedDocs.includes(key)) docStatus[key] = "rejected";
  });

  return {
    backendId: raw.id,
    docsUploaded: !!raw.task_docs_upload,
    docsVerified: !!raw.task_docs_verify,
    backgroundCheckDone: !!raw.task_bgc,
    checkedIn: !!raw.task_checkin,
    status: raw.status || "Documents Pending",
    docStatus,
    uploadedDocNames,
    uploadedDocUrls,
    aadharNumber: raw.aadhar_number || "",
    panNumber: raw.pan_number || "",
    pfNumber: raw.pf_number || "",
    esiNumber: raw.esi_number || "",
    bankHolderName: raw.bank_holder_name || "",
    bankAccountNumber: raw.bank_account_number || "",
    bankIfsc: raw.bank_ifsc || "",
    bankName: raw.bank_name || "",
  };
}

/**
 * Fetch the current candidate's own onboarding record (auto-created when they
 * accept their offer). There is at most one per candidate today.
 * GET /api/onboarding/
 * @returns {Promise<object|null>} normalised record, or null if none exists yet
 * @throws {Error} on network / non-2xx responses
 */
export async function fetchMyOnboardingRecord() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/onboarding/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not load your onboarding record."));
  }
  const list = Array.isArray(data) ? data : data?.results ?? [];
  return list.length ? normalizeOnboardingRecord(list[0]) : null;
}

/**
 * Submit the candidate's identity/bank details and uploaded KYC documents.
 * PATCH /api/onboarding/{id}/ (multipart — some values are File objects)
 * @param {number} id onboarding record backend id (from fetchMyOnboardingRecord)
 * @param {object} fields text fields, e.g. { aadhar_number, pan_number, bank_holder_name, ... }
 * @param {object} files file fields, e.g. { aadhar_card, pan_card, bank_passbook, passport_photo, ... } — File objects, falsy entries skipped
 * @returns {Promise<object>} normalised record
 * @throws {Error} on network / non-2xx responses
 */
export async function submitOnboardingDocuments(id, fields = {}, files = {}) {
  const token = requireAuthToken();

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });
  Object.entries(files).forEach(([key, file]) => {
    if (file) formData.append(key, file);
  });
  formData.append("task_docs_upload", "true");

  const res = await fetch(`${BASE_URL}/onboarding/${id}/`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not submit your documents. Please try again."));
  }
  return normalizeOnboardingRecord(data);
}
