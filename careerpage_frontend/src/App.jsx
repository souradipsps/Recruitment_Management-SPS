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
import { fetchUserProfile, mapUserResponseToSavedProfile } from "./features/careerpage/services/applicationsService";

// App shell: owns the cross-cutting auth / apply / dashboard state and wires
// the public CareerPage together with the modals and candidate dashboard.
export default function App() {
  useKeepAwake();

  const [initialLoading, setInitialLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyAfterSignup, setApplyAfterSignup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(
    () => !!(localStorage.getItem("accessToken") && sessionStorage.getItem("dashboardOpen") === "true")
  );
  const [dashboardInitialTab, setDashboardInitialTab] = useState(
    () => (localStorage.getItem("accessToken") && sessionStorage.getItem("dashboardTab")) || "dashboard"
  );
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

  const loaderTimerRef = useRef(null);

  // ── Lottie loader: shown on every page refresh for 1.5 s ────────────────
  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Prevent scrollbar visibility and scrolling when loaders are active
  useEffect(() => {
    if ((initialLoading && !showDashboard) || showLoader) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [initialLoading, showLoader, showDashboard]);

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

  // Restore the session from the stored JWT on page load/refresh — without
  // this, `loggedInUser` always starts blank and the user appears logged out.
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;
    fetchUserProfile()
      .then((fetchedData) => {
        if (!fetchedData) return;
        setLoggedInUser(fetchedData.first_name || fetchedData.full_name || fetchedData.email);
        setSignupData({
          name: fetchedData.first_name,
          lastName: fetchedData.last_name,
          email: fetchedData.email,
          phone: fetchedData.phone,
        });
        const saved = mapUserResponseToSavedProfile(fetchedData);
        if (saved) setSavedProfileData(saved);
        // Restore dashboard if it was open before the refresh
        if (sessionStorage.getItem("dashboardOpen") === "true") {
          setShowDashboard(true);
        }
      })
      .catch(() => {
        // Token invalid/expired — clear it so the UI doesn't keep retrying.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  }, []);

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
    sessionStorage.setItem("dashboardOpen", "true");
    sessionStorage.setItem("dashboardTab", "dashboard");
    setShowDashboard(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("dashboardOpen");
    sessionStorage.removeItem("dashboardTab");
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
      {initialLoading && !showDashboard && <LottieLoader />}

      {/* Branded maroon Loader — overlays on button click / logout */}
      <AnimatePresence>
        {showLoader && <Loader key="btn-loader" />}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </>
  );
}
