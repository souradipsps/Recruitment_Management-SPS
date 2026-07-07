import { AnimatePresence } from "motion/react";
import { jobs } from "../../mockData/jobs";
import { LoginModal } from "./modals/LoginModal";
import { ApplyModal } from "./modals/ApplyModal";
import JobApplicationModal from "./modals/JobApplicationModal";
import { CandidateDashboard } from "../dashboard/CandidateDashboard";
import {
  buildApplicationFormProfile,
  applyProfessionalData,
} from "../../lib/profileData";

// Renders the four overlay views (login, dashboard, job application, apply)
// driven by `deferredView`. All shell state and setters arrive via the `app`
// bag so App itself stays a thin composition layer.
export default function AppModals({ app }) {
  const {
    deferredView,
    loginTab,
    applyAfterSignup,
    cameFromApply,
    cameFromSection,
    dashboardInitialTab,
    loggedInUser,
    signupData,
    appliedJobIds,
    applicationsData,
    selectedJob,
    savedProfileData,
    applicationDraft,
    mergedProfileData,
    reloadWithLoader,
    handleLogout,
    loadUserProfile,
    setShowLogin,
    setApplyAfterSignup,
    setLoggedInUser,
    setShowDashboard,
    setSignupData,
    setShowApply,
    setShowJobApplicationModal,
    setCameFromApply,
    setCameFromSection,
    setAppliedJobIds,
    setApplicationsData,
    setApplicationDraft,
    setSavedProfileData,
    setDashboardInitialTab,
  } = app;

  return (
    <>
      <AnimatePresence>
        {deferredView === "login" && (
          <LoginModal
            onClose={() => {
              setShowLogin(false);
              setApplyAfterSignup(false);
            }}
            initialTab={loginTab}
            onLoginSuccess={async (name) => {
              setLoggedInUser(name);
              setShowLogin(false);
              setShowDashboard(false);
              await loadUserProfile();
              reloadWithLoader();
            }}
            onSignupSuccess={async (data) => {
              setLoggedInUser(data.name);
              setSignupData(data);
              setApplyAfterSignup(false);
              await loadUserProfile();
              if (applyAfterSignup) setShowApply(true);
              reloadWithLoader();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deferredView === "dashboard" && (
          <CandidateDashboard
            onClose={(bypassApplyModal) => {
              setShowDashboard(false);
              if (cameFromApply && !bypassApplyModal) {
                setShowJobApplicationModal(true);
                setCameFromApply(false);
              } else {
                setShowJobApplicationModal(false);
                setCameFromApply(false);
                setCameFromSection(undefined);
              }
            }}
            onLogout={handleLogout}
            userName={loggedInUser}
            signupData={signupData}
            appliedJobIds={appliedJobIds}
            allJobs={jobs}
            initialProfileData={mergedProfileData}
            initialTab={dashboardInitialTab}
            initialSection={cameFromSection}
            onProfileUpdate={(updatedData) => {
              setSavedProfileData(updatedData);
              setApplicationDraft(null);
            }}
            applicationsData={applicationsData}
            cameFromApply={cameFromApply}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deferredView === "jobApplication" && (
          <JobApplicationModal
            job={
              selectedJob
                ? {
                  id: selectedJob.id,
                  title: selectedJob.title,
                  department: selectedJob.department,
                  location: selectedJob.location,
                  type: selectedJob.type,
                }
                : null
            }
            onClose={() => {
              setShowJobApplicationModal(false);
              setApplicationDraft(null);
              setCameFromSection(undefined);
            }}
            onSubmit={(jobId, formData, professionalData) => {
              setAppliedJobIds((prev) => [...prev, jobId]);
              setApplicationsData((prev) => ({ ...prev, [jobId]: formData }));
              setApplicationDraft(null);
              setCameFromSection(undefined);
              if (professionalData) {
                setSavedProfileData((prev) =>
                  applyProfessionalData(prev, professionalData, { signupData, loggedInUser }),
                );
              }
            }}
            onEditProfile={(draftData, section) => {
              setApplicationDraft(draftData);
              setCameFromApply(true);
              setCameFromSection(section);
              setShowJobApplicationModal(false);
              setDashboardInitialTab("resume");
              setShowDashboard(true);
            }}
            profileData={buildApplicationFormProfile({ savedProfileData, signupData, loggedInUser })}
            resumeFile={savedProfileData?.resumeFile || null}
            resumeUrl={savedProfileData?.resumeUrl || null}
            draftData={applicationDraft}
            savedProfileData={savedProfileData}
            scrollToSection={cameFromSection}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deferredView === "apply" && (
          <ApplyModal
            onClose={() => setShowApply(false)}
            signupData={signupData}
            onSubmitData={(data) => {
              setSavedProfileData(data);
              setShowApply(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
