// Network layer for the candidate's own offer letter(s).
//
// GET  /api/offers/                 -> candidate sees only their own offers
// POST /api/offers/{id}/accept/     -> accept (auto-creates an OnboardingRecord)
// POST /api/offers/{id}/decline/    -> decline
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
