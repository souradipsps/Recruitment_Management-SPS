import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Toaster } from "sonner";
import { AnimatePresence } from "motion/react";
import { useKeepAwake } from "./lib/keepAwake";
import { useViewTransition } from "./lib/useViewTransition";
import { buildMergedProfileData } from "./lib/profileData";
import { Loader } from "./components/common/Loader";
import { LottieLoader } from "./components/common/LottieLoader";
import { CareerPage } from "./features/careerpage/CareerPage";
import AppModals from "./features/careerpage/AppModals";

// App shell: owns the cross-cutting auth / apply / dashboard state and wires
// the public CareerPage together with the modals and candidate dashboard.
export default function App() {
  useKeepAwake();

  // ── Lottie loader: shown on every page refresh for 1.5 s ────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // ── Branded maroon Loader: shown briefly on button clicks ────────────────
  // Login / Sign Up / Apply / Submit Profile → 600 ms flash before modal opens.
  // Logout → 1.5 s flash.
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimerRef = useRef(null);

  const openWithLoader = useCallback((then, ms = 600) => {
    if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
    setShowLoader(true);
    loaderTimerRef.current = setTimeout(() => {
      setShowLoader(false);
      then?.();
    }, ms);
  }, []);

  const reloadWithLoader = useCallback(() => {
    if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
    setShowLoader(true);
    loaderTimerRef.current = setTimeout(() => setShowLoader(false), 1500);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => () => { if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current); }, []);

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

  // Opens login/signup modal directly — no loader on navbar button click.
  const openModal = (tab) => {
    setLoginTab(tab);
    setShowLogin(true);
  };

  // Job apply: if not logged in show login modal directly.
  const handleApplyJob = (job) => {
    if (!loggedInUser) {
      openModal("login");
      return;
    }
    setSelectedJob(job);
    setShowJobApplicationModal(true);
  };

  // General application / Submit Profile — open signup modal directly.
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
    setApplicationDraft,
    setSavedProfileData,
    setDashboardInitialTab,
    // Allows form submit handlers inside modals to trigger the branded loader
    setShowLoader,
  };

  return (
    <>
      {/* Career page always renders immediately underneath both loaders */}
      <CareerPage
        loggedInUser={loggedInUser}
        onLogin={() => openModal("login")}
        onSignup={handleSignup}
        onOpenDashboard={handleOpenDashboard}
        onLogout={handleLogout}
        onApplyJob={handleApplyJob}
        appliedJobIds={appliedJobIds}
      />

      <AppModals app={modalApp} />

      {/* Lottie loader — overlays on page refresh only */}
      {initialLoading && <LottieLoader />}

      {/* Branded maroon Loader — overlays on button click / logout */}
      <AnimatePresence>
        {showLoader && <Loader key="btn-loader" />}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </>
  );
}
