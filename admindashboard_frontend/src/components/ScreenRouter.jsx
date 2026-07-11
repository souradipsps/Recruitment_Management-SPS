import Dashboard from "../screens/Dashboard";
import ExistingRoles from "../screens/ExistingRoles";
import RoleRequests from "../screens/RoleRequests";
import JobRequests from "../screens/JobRequests";
import ApprovalRequests from "../screens/ApprovalRequests";
import JobPostings from "../screens/JobPostings";
import Applications from "../screens/Applications";
import InterviewPanel from "../screens/InterviewPanel";
import Panelist from "../screens/Panelist";
import Onboarding from "../screens/Onboarding";
import OfferManagement from "../screens/OfferManagement";

// Maps the active nav id to its screen, wiring in shared state.
// `s` is the app state bag from App; `navigate(id)` switches the active screen.
export default function ScreenRouter({ active, s, navigate, onGiveOffer }) {
  switch (active) {
    case "dashboard":
      return <Dashboard approvalRequests={s.approvalRequests} />;
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
        />
      );
    case "panelist":
      return (
        <Panelist
          interviews={s.interviews}
          setInterviews={s.setInterviews}
          jobPostings={s.jobPostings}
          currentUser={s.currentUser?.role || "admin"}
        />
      );
    case "offer-management":
      return <OfferManagement offers={s.offers} setOffers={s.setOffers} jobPostings={s.jobPostings} />;
    case "onboarding":
      return <Onboarding jobPostings={s.jobPostings} offers={s.offers} />;
    default:
      return <Dashboard approvalRequests={s.approvalRequests} />;
  }
}
