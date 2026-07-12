import { AnimatePresence } from "motion/react";
import { LoginModal } from "./modals/LoginModal";
import { ApplyModal } from "./modals/ApplyModal";
import JobApplicationModal from "./modals/JobApplicationModal";
import { CandidateDashboard } from "../dashboard/CandidateDashboard";
import {
  buildApplicationFormProfile,
  applyProfessionalData,
} from "../../lib/profileData";
import { fetchUserProfile, mapUserResponseToSavedProfile } from "./services/applicationsService";

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
    selectedJob,
    savedProfileData,
    applicationDraft,
    mergedProfileData,
    reloadWithLoader,
    handleLogout,
    showLogin,
    setShowLogin,
    showApply,
    setShowApply,
    setApplyAfterSignup,
    setLoggedInUser,
    setShowDashboard,
    setSignupData,
    setShowJobApplicationModal,
    setCameFromApply,
    setCameFromSection,
    setAppliedJobIds,
    setApplicationDraft,
    setSavedProfileData,
    setDashboardInitialTab,
    setShowLoader,
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
            onFormSubmit={() => setShowLoader(true)}
            onFormError={() => setShowLoader(false)}
            onLoginSuccess={(name, userData) => {
              setLoggedInUser(name);
              setShowLogin(false);
              setShowDashboard(false);
              
              // Delay turning off loader to prevent login modal flicker during transition
              setTimeout(() => {
                setShowLoader(false);
              }, 300);

              // Background fetch of profile details so user isn't waiting on it to log in
              fetchUserProfile()
                .then((fetchedData) => {
                  if (fetchedData) {
                    setSignupData({
                      name: fetchedData.first_name,
                      lastName: fetchedData.last_name,
                      email: fetchedData.email,
                      phone: fetchedData.phone,
                    });
                    const saved = mapUserResponseToSavedProfile(fetchedData);
                    if (saved) setSavedProfileData(saved);
                  }
                })
                .catch(() => {});
            }}
            onSignupSuccess={(data) => {
              setLoggedInUser(data.name);
              setSignupData(data);
              setApplyAfterSignup(false);
              if (applyAfterSignup) setShowApply(true);
              
              // Delay turning off loader to prevent signup modal flicker during transition
              setTimeout(() => {
                setShowLoader(false);
              }, 300);
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
            initialProfileData={mergedProfileData}
            initialTab={dashboardInitialTab}
            initialSection={cameFromSection}
            onProfileUpdate={(updatedData) => {
              setSavedProfileData(updatedData);
              setApplicationDraft(null);
            }}
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
            onFormSubmit={() => setShowLoader(true)}
            onFormError={() => setShowLoader(false)}
            onSubmit={(jobId, _formData, professionalData) => {
              setAppliedJobIds((prev) => [...prev, jobId]);
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
            onFormSubmit={() => setShowLoader(true)}
            onFormError={() => setShowLoader(false)}
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
