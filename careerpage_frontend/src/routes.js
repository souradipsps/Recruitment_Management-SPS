
export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  apply: "/apply",
  jobApply: (jobId) => `/jobs/${jobId}/apply`,
  jobApplyPattern: "/jobs/:jobId/apply",
  dashboard: "/dashboard",
  dashboardTab: (tab) => (tab === "dashboard" ? "/dashboard" : `/dashboard/${tab}`),
  dashboardTabPattern: "/dashboard/:tab?",
};
