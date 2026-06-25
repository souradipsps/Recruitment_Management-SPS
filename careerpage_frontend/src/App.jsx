import { useState, useMemo, useEffect } from "react";
import { Toaster } from "sonner";
import { useKeepAwake } from "./lib/keepAwake";
import { jobs } from "./data/jobs";
import { CareerPage } from "./features/careerpage/CareerPage";
import { LoginModal } from "./features/careerpage/modals/LoginModal";
import { ApplyModal } from "./features/careerpage/modals/ApplyModal";
import JobApplicationModal from "./features/careerpage/modals/JobApplicationModal";
import { CandidateDashboard } from "./features/dashboard/CandidateDashboard";

// App shell: owns the cross-cutting auth / apply / dashboard state and wires
// the public CareerPage together with the modals and candidate dashboard.
// these are the changes git commit
export default function App() {
  useKeepAwake();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const [showLogin, setShowLogin] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyAfterSignup, setApplyAfterSignup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState("dashboard");
  const [loggedInUser, setLoggedInUser] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [signupData, setSignupData] = useState(null);
  const [showJobApplicationModal, setShowJobApplicationModal] = useState(false);
  const [savedProfileData, setSavedProfileData] = useState(null);
  const [cameFromApply, setCameFromApply] = useState(false);
  const [cameFromSection, setCameFromSection] = useState(undefined);
  const [applicationDraft, setApplicationDraft] = useState(null);
  const [applicationsData, setApplicationsData] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [loginTab, setLoginTab] = useState("login");

  const openModal = (tab) => {
    setLoginTab(tab);
    setShowLogin(true);
  };

  const handleApplyJob = (job) => {
    if (!loggedInUser) {
      openModal("login");
      return;
    }
    setSelectedJob(job);
    setShowJobApplicationModal(true);
  };

  const handleSignup = () => {
    setApplyAfterSignup(true);
    openModal("signup");
  };

  const handleOpenDashboard = () => {
    setDashboardInitialTab("dashboard");
    setShowDashboard(true);
  };

  const mergedProfileData = useMemo(() => {
    if (!savedProfileData && !applicationDraft) return null;
    return {
      fullName: savedProfileData?.fullName || (signupData ? `${signupData.name} ${signupData.lastName || ""}`.trim() : loggedInUser),
      email: savedProfileData?.email || signupData?.email || "",
      phone: savedProfileData?.phone || signupData?.phone || "",
      location: savedProfileData?.location || "Guwahati, Assam",
      resumeFile: savedProfileData?.resumeFile || "",
      resumeUrl: savedProfileData?.resumeUrl || "",
      education: applicationDraft?.education ?? savedProfileData?.education ?? "",
      degreeName: applicationDraft?.degreeName ?? savedProfileData?.degreeName ?? "",
      professionalQualification: applicationDraft?.professionalQual ?? savedProfileData?.professionalQualification ?? "",
      professionalQualificationOther: applicationDraft?.professionalQualOther ?? savedProfileData?.professionalQualificationOther ?? "",
      experience: applicationDraft?.experience ?? savedProfileData?.experience ?? "",
      salary: applicationDraft?.salary ?? savedProfileData?.salary ?? "",
      extracurricular: applicationDraft?.extracurricular ?? savedProfileData?.extracurricular ?? "",
      extracurricularOther: applicationDraft?.extracurricularOther ?? savedProfileData?.extracurricularOther ?? "",
      selectedRoles: applicationDraft?.selectedRoles ?? savedProfileData?.selectedRoles ?? [],
      selectedSkills: applicationDraft?.selectedSkills ?? savedProfileData?.selectedSkills ?? [],
      linkedin: applicationDraft?.linkedin ?? savedProfileData?.linkedin ?? "",
      portfolio: applicationDraft?.portfolio ?? savedProfileData?.portfolio ?? "",
    };
  }, [savedProfileData, applicationDraft, signupData, loggedInUser]);

  useEffect(() => {
    if (!showDashboard && !showLogin && !showApply && !showJobApplicationModal) {
      window.scrollTo({ top: 0, behavior: "instant" });
      const t1 = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
      const t2 = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 50);
      const t3 = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [showDashboard, showLogin, showApply, showJobApplicationModal]);

  return (
    <>
      <CareerPage
        loggedInUser={loggedInUser}
        onLogin={() => openModal("login")}
        onSignup={handleSignup}
        onOpenDashboard={handleOpenDashboard}
        onLogout={() => setLoggedInUser("")}
        onApplyJob={handleApplyJob}
        appliedJobIds={appliedJobIds}
      />

      {showLogin && (
        <LoginModal
          onClose={() => {
            setShowLogin(false);
            setApplyAfterSignup(false);
          }}
          initialTab={loginTab}
          onLoginSuccess={(name) => {
            setLoggedInUser(name);
            setShowLogin(false);
            setShowDashboard(false);
          }}
          onSignupSuccess={(data) => {
            setLoggedInUser(data.name);
            setSignupData(data);
            setApplyAfterSignup(false);
            if (applyAfterSignup) setShowApply(true);
          }}
        />
      )}

      {showDashboard && (
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
          onLogout={() => {
            setLoggedInUser("");
            setShowDashboard(false);
            setCameFromApply(false);
            setCameFromSection(undefined);
          }}
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
        />
      )}

      {showJobApplicationModal && (
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
              setSavedProfileData((prev) => ({
                ...(prev || {
                  fullName: signupData
                    ? `${signupData.name} ${signupData.lastName || ""}`.trim()
                    : loggedInUser,
                  email: signupData?.email || "",
                  phone: signupData?.phone || "",
                  location: "Guwahati, Assam",
                  resumeFile: "",
                  resumeUrl: "",
                }),
                education: professionalData.education,
                degreeName: professionalData.degreeName,
                professionalQualification: professionalData.professionalQualification,
                professionalQualificationOther: professionalData.professionalQualificationOther,
                experience: professionalData.experience,
                salary: professionalData.salary,
                extracurricular: professionalData.extracurricular,
                extracurricularOther: professionalData.extracurricularOther,
                selectedRoles: professionalData.selectedRoles,
                selectedSkills: professionalData.selectedSkills,
                linkedin: professionalData.linkedin,
                portfolio: professionalData.portfolio,
              }));
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
          profileData={{
            firstName:
              savedProfileData?.fullName?.split(" ")[0] ||
              signupData?.name ||
              loggedInUser,
            lastName:
              savedProfileData?.fullName?.split(" ").slice(1).join(" ") ||
              signupData?.lastName ||
              "",
            email: savedProfileData?.email || "",
            phone: savedProfileData?.phone || "",
            location: savedProfileData?.location || "Guwahati, Assam",
          }}
          resumeFile={savedProfileData?.resumeFile || null}
          resumeUrl={savedProfileData?.resumeUrl || null}
          draftData={applicationDraft}
          savedProfileData={savedProfileData}
          scrollToSection={cameFromSection}
        />
      )}

      {showApply && (
        <ApplyModal
          onClose={() => setShowApply(false)}
          signupData={signupData}
          onSubmitData={(data) => {
            setSavedProfileData(data);
            setShowApply(false);
          }}
        />
      )}

      <Toaster richColors position="top-right" />
    </>
  );
}
