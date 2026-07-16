// Panelists API client.
// Auth token comes from the login flow via authApi (read dynamically per request).
import { authHeaders, authFetch, getAccessToken, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/panelists/`;

// Map one API record -> the shape the Interview Panel screen expects.
// Department is intentionally ignored per requirements.
export const normalizePanelist = (p) => ({
  backendId: p.id,
  name: p.name || "",
  email: p.email || "",
  phone: p.phone || "",
  isActive: p.is_active ?? true,
});

// GET /api/panelists/ -> normalized array.
export async function fetchPanelists() {
  const res = await authFetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load panelists (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || []; // handle DRF pagination
  return list.map(normalizePanelist);
}

// POST /api/panelists/ — registers a new panelist.
// Department is intentionally omitted from the payload per requirements.
export async function createPanelist({ name, email, phone }) {
  if (!getAccessToken()) {
    throw new Error("Not authenticated — please log in.");
  }

  const payload = {
    name: (name || "").trim(),
    email: (email || "").trim(),
    phone: (phone || "").trim(),
  };

  const res = await authFetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return normalizePanelist(data);
}
