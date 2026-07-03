import { useState, useMemo, useEffect } from "react";
import { Toaster } from "sonner";
import { AnimatePresence } from "motion/react";
import { useKeepAwake } from "./lib/keepAwake";
import { useViewTransition } from "./lib/useViewTransition";
import { buildMergedProfileData } from "./lib/profileData";
import { Loader } from "./components/common/Loader";
import { CareerPage } from "./features/careerpage/CareerPage";
import AppModals from "./features/careerpage/AppModals";

// App shell: owns the cross-cutting auth / apply / dashboard state and wires
// the public CareerPage together with the modals and candidate dashboard.
export default function App() {
  useKeepAwake();

  const [initialLoading, setInitialLoading] = useState(true);

  // Show the branded loader for 1.5s, e.g. after login/signup or on logout.
  const reloadWithLoader = () => {
    setInitialLoading(true);
    setTimeout(() => setInitialLoading(false), 1500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const view = showDashboard
    ? "dashboard"
    : showJobApplicationModal
      ? "jobApplication"
      : showApply
        ? "apply"
        : showLogin
          ? "login"
          : "career";

  const { deferredView } = useViewTransition(view);

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
    setCameFromApply(false);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setLoggedInUser("");
    setShowDashboard(false);
    setCameFromApply(false);
    setCameFromSection(undefined);
    reloadWithLoader();
  };

  const mergedProfileData = useMemo(
    () => buildMergedProfileData({ savedProfileData, applicationDraft, signupData, loggedInUser }),
    [savedProfileData, applicationDraft, signupData, loggedInUser],
  );

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

  // Everything the overlay modals need to read and mutate.
  const modalApp = {
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
  };

  return (
    <>
      {!initialLoading && (
        <CareerPage
          loggedInUser={loggedInUser}
          onLogin={() => openModal("login")}
          onSignup={handleSignup}
          onOpenDashboard={handleOpenDashboard}
          onLogout={handleLogout}
          onApplyJob={handleApplyJob}
          appliedJobIds={appliedJobIds}
        />
      )}

      <AppModals app={modalApp} />

      <AnimatePresence>
        {initialLoading && <Loader />}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </>
  );
}
