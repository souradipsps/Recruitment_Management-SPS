// Network layer for public job postings.
//
// The live API (GET /job-postings/public/) returns objects whose shape does
// NOT match what the UI (`JobCard`, `useJobFilters`) expects. Rather than
// litter mapping logic through the components, everything is normalised here
// once, so the rest of the feature keeps consuming the same job shape it used
// with the old mock data.

// Base URL comes solely from the environment (.env → VITE_API_BASE_URL), same
// as ./authService.js.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

// The API stores multi-line qualification/skill text as a single string with
// "\n" separators (and sometimes "\r\n" or bullet characters). The UI wants a
// clean array, one item per line.
function splitLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

// Map one raw API record onto the shape the components already understand.
export function normalizeJob(raw) {
  return {
    // Identity ---------------------------------------------------------------
    id: raw.id,
    postingId: raw.posting_id ?? null,
    existing_role: raw.existing_role || null,

    // Header -----------------------------------------------------------------
    title: raw.role ?? raw.title ?? "Untitled Position",
    department: (raw.department && raw.department.trim()) || "General",
    type: raw.type ?? "Full-time",
    // `category` can be null on the API; keep it null so the default
    // "All Positions" filter still matches (category filtering is opt-in).
    category: raw.category ?? null,
    location: (raw.location && raw.location.trim()) || "Guwahati, Assam",

    // Body -------------------------------------------------------------------
    description: raw.description ?? "",
    // Prefer the free-text educational field; fall back to the (often empty)
    // structured `qualifications` array.
    qualifications: splitLines(
      raw.educational_qualifications || raw.qualifications
    ),
    // `undefined` (not []) so JobCard's built-in default skills list kicks in
    // when the API sends nothing.
    skills: splitLines(raw.skills_required).length
      ? splitLines(raw.skills_required)
      : undefined,

    // Meta row ---------------------------------------------------------------
    experience: (raw.experience && raw.experience.trim()) || null,
    salaryRange: (raw.salary_range && raw.salary_range.trim()) || null,

    deadline: raw.deadline || null,
    status: raw.status ?? null,
  };
}

/**
 * Fetch all published public job postings, already normalised for the UI.
 * @returns {Promise<Array>} normalised job objects
 * @throws {Error} on network / non-2xx responses
 */
export async function fetchPublicJobs() {
  const res = await fetch(`${BASE_URL}/job-postings/public/`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load jobs (HTTP ${res.status}).`);
  }

  const data = await res.json();
  // Endpoint returns a bare array; tolerate a paginated { results: [...] } too.
  const list = Array.isArray(data) ? data : data?.results ?? [];

  return list
    .filter((raw) => (raw.status ? raw.status === "Published" : true))
    .map(normalizeJob);
}
