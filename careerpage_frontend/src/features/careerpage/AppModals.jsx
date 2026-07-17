import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { LoginModal } from "./modals/LoginModal";
import { ApplyModal } from "./modals/ApplyModal";
import JobApplicationModal from "./modals/JobApplicationModal";
import { CandidateDashboard } from "../dashboard/CandidateDashboard";
import {
  buildApplicationFormProfile,
  applyProfessionalData,
} from "../../lib/profileData";
import { fetchUserProfile, mapUserResponseToSavedProfile } from "./services/applicationsService";
import { routes } from "../../routes";

// Renders the four overlay views (login, dashboard, job application, apply)
// driven by `deferredView`. All shell state and setters arrive via the `app`
// bag so App itself stays a thin composition layer. Which URL each overlay
// closes back to is decided here via `navigate()`.
export default function AppModals({ app }) {
  const navigate = useNavigate();

  const {
    deferredView,
    loginTab,
    applyAfterSignup,
    cameFromApply,
    cameFromSection,
    loggedInUser,
    signupData,
    selectedJob,
    savedProfileData,
    applicationDraft,
    mergedProfileData,
    reloadWithLoader,
    handleLogout,
    setApplyAfterSignup,
    setLoggedInUser,
    setSignupData,
    setCameFromApply,
    setCameFromSection,
    setAppliedJobIds,
    setApplicationDraft,
    setSavedProfileData,
    setShowLoader,
    initialLoading,
    dashboardLoadedOnce,
    setDashboardLoadedOnce,
  } = app;

  return (
    <>
      <AnimatePresence>
        {deferredView === "login" && (
          <LoginModal
            onClose={() => {
              // SignupForm calls onSignupSuccess then this onClose in the same
              // synchronous handler — reading applyAfterSignup here (captured
              // in this render, before the setState below commits) keeps both
              // calls agreeing on the same destination.
              navigate(applyAfterSignup ? routes.apply : routes.home);
              setApplyAfterSignup(false);
            }}
            initialTab={loginTab}
            onTabChange={(nextTab) => navigate(nextTab === "signup" ? routes.signup : routes.login, { replace: true })}
            onFormSubmit={() => setShowLoader(true)}
            onFormError={() => setShowLoader(false)}
            onLoginSuccess={(name, userData) => {
              setLoggedInUser(name);

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
              if (cameFromApply && !bypassApplyModal && selectedJob) {
                navigate(routes.jobApply(selectedJob.id));
                setCameFromApply(false);
              } else {
                setCameFromApply(false);
                setCameFromSection(undefined);
                navigate(routes.home);
              }
            }}
            onLogout={handleLogout}
            userName={loggedInUser}
            signupData={signupData}
            initialProfileData={mergedProfileData}
            initialSection={cameFromSection}
            onProfileUpdate={(updatedData) => {
              setSavedProfileData(updatedData);
              setApplicationDraft(null);
            }}
            cameFromApply={cameFromApply}
            initialLoading={initialLoading}
            dashboardLoadedOnce={dashboardLoadedOnce}
            setDashboardLoadedOnce={setDashboardLoadedOnce}
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
              navigate(routes.home);
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
              navigate(routes.dashboardTab("resume"));
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
            onClose={() => navigate(routes.home)}
            signupData={signupData}
            onFormSubmit={() => setShowLoader(true)}
            onFormError={() => setShowLoader(false)}
            onSubmitData={(data) => {
              setSavedProfileData(data);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
