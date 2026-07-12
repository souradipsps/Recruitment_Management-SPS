// Panelists API client.
// Uses the access token from .env (no login flow yet), mirroring jobRequestsApi.js.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/panelists/`;
const ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
});

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
  const res = await fetch(API_URL, { headers: authHeaders() });

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
  if (!ACCESS_TOKEN) {
    throw new Error("Missing VITE_API_ACCESS_TOKEN in .env");
  }

  const payload = {
    name: (name || "").trim(),
    email: (email || "").trim(),
    phone: (phone || "").trim(),
  };

  const res = await fetch(API_URL, {
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
