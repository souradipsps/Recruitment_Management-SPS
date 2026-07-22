import React, { Suspense } from "react";
import { isAdmin, resolvePanelistName } from "../authRules";

// Lazy-loaded screen components for Vite route code-splitting
const Dashboard = React.lazy(() => import("../screens/Dashboard"));
const ExistingRoles = React.lazy(() => import("../screens/ExistingRoles"));
const RoleRequests = React.lazy(() => import("../screens/RoleRequests"));
const JobRequests = React.lazy(() => import("../screens/JobRequests"));
const ApprovalRequests = React.lazy(() => import("../screens/ApprovalRequests"));
const JobPostings = React.lazy(() => import("../screens/JobPostings"));
const Applications = React.lazy(() => import("../screens/Applications"));
const InterviewPanel = React.lazy(() => import("../screens/InterviewPanel"));
const Panelist = React.lazy(() => import("../screens/Panelist"));
const Onboarding = React.lazy(() => import("../screens/Onboarding"));
const OfferManagement = React.lazy(() => import("../screens/OfferManagement"));

// Maps the active nav id to its screen, wiring in shared state.
// `s` is the app state bag from App; `navigate(id)` switches the active screen.
export default function ScreenRouter({ active, s, navigate, onGiveOffer }) {
  // Premium loading spinner fallback for screen lazy loads
  const fallback = (
    <div style={{
      display: "flex", flex: 1, height: "70vh",
      alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        width: 40, height: 40,
        borderRadius: "50%",
        border: "3px solid #72102a15",
        borderTop: "3px solid #72102a",
        animation: "spin 0.8s linear infinite"
      }} />
      <div style={{ fontSize: 12, color: "#72102a", fontWeight: 700, letterSpacing: "0.08em" }}>LOADING MODULE...</div>
    </div>
  );

  const renderContent = () => {
    // Non-admins (panelists) can only ever reach the Panelist screen, no matter
    // what `active` is — this is what actually blocks stray navigation (e.g. the
    // "Pending" bell in TopBar), not just hiding the sidebar buttons for it.
    if (!isAdmin(s.currentUser)) {
      return (
        <Panelist
          interviews={s.interviews}
          setInterviews={s.setInterviews}
          jobPostings={s.jobPostings}
          panelists={s.panelists}
          currentUser={resolvePanelistName(s.currentUser, s.panelists)}
        />
      );
    }

    switch (active) {
      case "dashboard":
        return (
          <Dashboard
            approvalRequests={s.approvalRequests}
            jobPostings={s.jobPostings}
            jobApplications={s.jobApplications}
            generalApplications={s.generalApplications}
            interviews={s.interviews}
            offers={s.offers}
            existingRoles={s.existingRoles}
            stats={s.dashboardStats}
            navigate={navigate}
          />
        );
      case "existing-roles":
        return <ExistingRoles roles={s.existingRoles} setRoles={s.setExistingRoles} />;
      case "role-requests":
        return (
          <RoleRequests
            roleRequests={s.roleRequests}
            setRoleRequests={s.setRoleRequests}
            setApprovalRequests={s.setApprovalRequests}
            existingRoles={s.existingRoles}
            setExistingRoles={s.setExistingRoles}
            onNavigateToExistingRoles={() => navigate("existing-roles")}
            currentUser={s.currentUser}
          />
        );
      case "job-requests":
        return (
          <JobRequests
            jobRequests={s.jobRequests}
            setJobRequests={s.setJobRequests}
            approvalRequests={s.approvalRequests}
            setApprovalRequests={s.setApprovalRequests}
            jobPostings={s.jobPostings}
            setJobPostings={s.setJobPostings}
            existingRoles={s.existingRoles}
            onNavigateToApplications={() => navigate("applications")}
            currentUser={s.currentUser}
          />
        );
      case "approval-requests":
        return (
          <ApprovalRequests
            requests={s.approvalRequests}
            setRequests={s.setApprovalRequests}
            existingRoles={s.existingRoles}
            setExistingRoles={s.setExistingRoles}
            jobPostings={s.jobPostings}
            setJobPostings={s.setJobPostings}
            setRoleRequests={s.setRoleRequests}
            setJobRequests={s.setJobRequests}
            onNavigateToApplications={() => navigate("applications")}
            onNavigateToExistingRoles={() => navigate("existing-roles")}
            currentUser={s.currentUser}
          />
        );
      case "job-postings":
        return (
          <JobPostings
            postings={s.jobPostings}
            setPostings={s.setJobPostings}
            jobRequests={s.jobRequests}
            existingRoles={s.existingRoles}
          />
        );
      case "applications":
        return (
          <Applications
            jobApplications={s.jobApplications}
            setJobApplications={s.setJobApplications}
            generalApplications={s.generalApplications}
            setGeneralApplications={s.setGeneralApplications}
            jobPostings={s.jobPostings}
            jobRequests={s.jobRequests}
            interviews={s.interviews}
            setInterviews={s.setInterviews}
            onNavigate={navigate}
          />
        );
      case "interview-panel":
        return (
          <InterviewPanel
            jobApplications={s.jobApplications}
            generalApplications={s.generalApplications}
            jobPostings={s.jobPostings}
            interviews={s.interviews}
            setInterviews={s.setInterviews}
            panelists={s.panelists}
            setPanelists={s.setPanelists}
            onGiveOffer={onGiveOffer}
            offers={s.offers}
            setOffers={s.setOffers}
            existingRoles={s.existingRoles}
          />
        );
      case "panelist":
        return (
          <Panelist
            interviews={s.interviews}
            setInterviews={s.setInterviews}
            jobPostings={s.jobPostings}
            panelists={s.panelists}
            currentUser="admin"
          />
        );
      case "offer-management":
        return <OfferManagement offers={s.offers} setOffers={s.setOffers} jobPostings={s.jobPostings} interviews={s.interviews} panelists={s.panelists} existingRoles={s.existingRoles} />;
      case "onboarding":
        return (
          <Onboarding
            jobPostings={s.jobPostings}
            jobApplications={s.jobApplications}
            generalApplications={s.generalApplications}
            offers={s.offers}
          />
        );
      default:
        return (
          <Dashboard
            approvalRequests={s.approvalRequests}
            jobPostings={s.jobPostings}
            jobApplications={s.jobApplications}
            generalApplications={s.generalApplications}
            interviews={s.interviews}
            offers={s.offers}
            existingRoles={s.existingRoles}
            stats={s.dashboardStats}
            navigate={navigate}
          />
        );
    }
  };

  return <Suspense fallback={fallback}>{renderContent()}</Suspense>;
}
