// Network layer for the candidate's own upcoming interviews.
//
// GET /api/interviews/upcoming/ returns only the logged-in candidate's scheduled
// future interviews (status "Scheduled" AND date >= today). The raw API shape does
// NOT match what InterviewsSection renders, so it is normalised here once — same
// approach as ./jobsService.js — keeping the component consuming the shape it
// previously got from mock data.

import { parseApiError } from "./authService";

// Base URL comes solely from the environment (.env → VITE_API_BASE_URL), same
// as ./authService.js and ./jobsService.js.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

function requireAuthToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("You must be logged in to view your interviews. Please log in and try again.");
  return token;
}

// "2026-07-10" -> "July 10, 2026". Falls back to the raw value if unparseable.
function formatDate(raw) {
  if (!raw) return "";
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// "14:00:00" -> "2:00 PM". Falls back to the raw value if unparseable.
function formatTime(raw) {
  if (!raw) return "";
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;
  const h = parseInt(m[1], 10);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m[2]} ${ap}`;
}

// Infer a human-friendly platform name from the meeting link (used as the
// "via {platform}" subtitle for online interviews).
function inferPlatform(mode, link) {
  if (mode !== "Online") return null;
  if (!link) return "Online Meeting";
  const l = link.toLowerCase();
  if (l.includes("meet.google")) return "Google Meet";
  if (l.includes("zoom")) return "Zoom";
  if (l.includes("teams.microsoft") || l.includes("teams.live")) return "Microsoft Teams";
  return "Online Meeting";
}

// Map one raw API record onto the shape InterviewsSection already understands:
// { id, role, round, date, time, mode, platform, link, status }.
export function normalizeInterview(raw) {
  const mode = raw.mode === "Online" ? "Online" : "In-Person";
  return {
    id: raw.id,
    role: raw.role || "Interview",
    round: raw.round || null,
    date: formatDate(raw.date),
    time: formatTime(raw.time),
    mode,
    platform: inferPlatform(mode, raw.meeting_link),
    link: raw.meeting_link || null,
    // The API status for these is "Scheduled"; the UI badge reads "Upcoming".
    status: raw.status === "Scheduled" ? "Upcoming" : (raw.status || "Upcoming"),
  };
}

/**
 * Fetch the current candidate's upcoming interviews, already normalised for the UI.
 * GET /api/interviews/upcoming/
 * @returns {Promise<Array>} normalised interview objects
 * @throws {Error} on network / non-2xx responses
 */
export async function fetchUpcomingInterviews() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/interviews/upcoming/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not load your interviews."));
  }
  // Endpoint returns a bare array; tolerate a paginated { results: [...] } too.
  const list = Array.isArray(data) ? data : data?.results ?? [];

  return list.map(normalizeInterview);
}
