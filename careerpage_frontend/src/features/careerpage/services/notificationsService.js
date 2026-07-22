import { parseApiError } from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=<your API base URL> and restart the dev server.");
}

function requireAuthToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("You must be logged in to view your notifications. Please log in and try again.");
  return token;
}

// Convert a timestamp (e.g. "2026-07-20T12:00:00Z") to human-friendly "2 hours ago", "1 day ago" etc.
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Map backend Notification object to front-end notifications shape
export function normalizeNotification(raw) {
  return {
    id: raw.id,
    text: raw.message || raw.title || "",
    time: formatTimeAgo(raw.created_at),
    read: raw.is_read || false,
    isNew: !raw.is_read,
  };
}

// GET /api/notifications/
export async function fetchMyNotifications() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/notifications/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not load your notifications."));
  }
  const list = Array.isArray(data) ? data : data?.results ?? [];
  return list.map(normalizeNotification);
}

// PATCH /api/notifications/{id}/mark_read/
export async function markNotificationRead(id) {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/notifications/${id}/mark_read/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not mark notification as read."));
  }
  return normalizeNotification(data);
}

// PATCH /api/notifications/mark_all_read/
export async function markAllNotificationsRead() {
  const token = requireAuthToken();

  const res = await fetch(`${BASE_URL}/notifications/mark_all_read/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiError(data, "Could not mark all notifications as read."));
  }
  return data;
}
