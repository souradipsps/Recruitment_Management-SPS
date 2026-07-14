// Offers API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/offers/`;

// Map one API record -> the shape the Offer Management screen expects.
export const normalizeOffer = (o) => ({
  id: o.offer_id || String(o.id),  // human id shown in the table (e.g. "OFR-2026-0003")
  backendId: o.id,                 // numeric pk, used for update/delete
  candidate: o.candidate_name || "",
  role: o.role || "",
  ctc: o.ctc || "",
  issued: o.issued_date || "",
  expiry: o.expiry_date || "",
  joining: o.joining_date || "",
  status: o.status || "Draft",
  candidateId: o.candidate ?? null,
});

// GET /api/offers/ -> normalized array.
export async function fetchOffers() {
  const res = await fetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load offers (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizeOffer);
}

// POST /api/offers/ -> create (or effectively regenerate) an offer.
export async function createOffer({ candidate, role, ctc, issued, expiry, joining, status, candidateId }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      candidate_name: candidate,
      role,
      ...(ctc ? { ctc } : {}),
      ...(issued ? { issued_date: issued } : {}),
      ...(expiry ? { expiry_date: expiry } : {}),
      ...(joining ? { joining_date: joining } : {}),
      status: status || "Sent",
      ...(candidateId ? { candidate: candidateId } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create offer (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return normalizeOffer(data);
}

// DELETE /api/offers/{backendId}/
export async function deleteOffer(backendId) {
  const res = await fetch(`${API_URL}${backendId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete offer (${res.status}): ${errText}`);
  }
}

// PATCH /api/offers/{backendId}/ -> update an existing offer.
export async function updateOffer(backendId, fields) {
  const body = {};
  if (fields.candidate !== undefined) body.candidate_name = fields.candidate;
  if (fields.role !== undefined) body.role = fields.role;
  if (fields.ctc !== undefined) body.ctc = fields.ctc;
  if (fields.issued !== undefined) body.issued_date = fields.issued;
  if (fields.expiry !== undefined) body.expiry_date = fields.expiry;
  if (fields.joining !== undefined) body.joining_date = fields.joining;
  if (fields.status !== undefined) body.status = fields.status;

  const res = await fetch(`${API_URL}${backendId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update offer (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return normalizeOffer(data);
}
