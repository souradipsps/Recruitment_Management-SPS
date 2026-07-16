// Single source of truth for "is this the HR Admin account" until the backend
// grants panelists a real, distinct role (see users/models.py role field).
export const ADMIN_EMAIL = "hr@southpoint.edu";

export const isAdmin = (currentUser) => currentUser?.email === ADMIN_EMAIL;

// The Panelist screen identifies "my own" interviews by matching the panelist's
// name in `interview.panel` (an array of names) — it has no other id to compare
// against. Resolve the logged-in user's own panelist name via email so their
// view can be scoped to only interviews/postings they're actually on.
export const resolvePanelistName = (currentUser, panelists = []) => {
  const match = panelists.find(
    (p) => p.email && currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase(),
  );
  return match?.name || currentUser?.name || "";
};
