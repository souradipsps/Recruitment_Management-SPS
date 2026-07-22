import { authHeaders, authFetch, API_BASE_URL } from "./authApi";

const API_URL = `${API_BASE_URL}/dashboard/stats/`;

export const normalizeDashboardStats = (s) => ({
  openPositions: s.open_positions ?? 0,
  pendingApprovals: s.pending_approvals ?? 0,
  totalApplicants: s.total_applicants ?? 0,
  interviewsScheduled: s.interviews_scheduled ?? 0,
  offersReleased: s.offers_released ?? 0,
  newJoiners: s.new_joiners ?? 0,
  offerAcceptanceRate: s.offer_acceptance_rate || "N/A",
  totalRoles: s.total_roles ?? 0,
  activeRoles: s.active_roles ?? 0,
  pipeline: {
    applied: s.pipeline?.applied ?? 0,
    shortlisted: s.pipeline?.shortlisted ?? 0,
    selected: s.pipeline?.selected ?? 0,
    offered: s.pipeline?.offered ?? 0,
  },
});

export async function fetchDashboardStats() {
  const res = await authFetch(API_URL, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to load dashboard stats (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  return normalizeDashboardStats(data);
}
