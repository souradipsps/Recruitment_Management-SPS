import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useMatch, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { AnimatePresence } from "motion/react";
import { useKeepAwake } from "./lib/keepAwake";
import { useViewTransition } from "./lib/useViewTransition";
import { buildMergedProfileData } from "./lib/profileData";
import { Loader } from "./components/common/Loader";
import { LottieLoader } from "./components/common/LottieLoader";
import { CareerPage } from "./features/careerpage/CareerPage";
import AppModals from "./features/careerpage/AppModals";
import { fetchUserProfile, mapUserResponseToSavedProfile } from "./features/careerpage/services/applicationsService";
import { fetchPublicJobs } from "./features/careerpage/services/jobsService";
import { routes } from "./routes";

// App shell: owns the cross-cutting auth / apply / dashboard state and wires
// the public CareerPage together with the modals and candidate dashboard.
// Which overlay is showing is driven by the URL (/login, /apply,
// /jobs/:jobId/apply, /dashboard) so it's deep-linkable, refresh-safe and
// works with the browser back/forward buttons.
export default function App() {
  useKeepAwake();

  const navigate = useNavigate();
  const location = useLocation();
  const jobApplyMatch = useMatch(routes.jobApplyPattern);
  const dashboardMatch = useMatch(routes.dashboardTabPattern);
  const [searchParams] = useSearchParams();

  const showLogin = location.pathname === routes.login;
  const showApply = location.pathname === routes.apply;
  const showJobApplicationModal = !!jobApplyMatch;
  const showDashboard = !!dashboardMatch;
  const loginTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  const [initialLoading, setInitialLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [applyAfterSignup, setApplyAfterSignup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [signupData, setSignupData] = useState(null);
  const [savedProfileData, setSavedProfileData] = useState(null);
  const [cameFromApply, setCameFromApply] = useState(false);
  const [cameFromSection, setCameFromSection] = useState(undefined);
  const [applicationDraft, setApplicationDraft] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const loaderTimerRef = useRef(null);
  const dashboardLoadedOnceRef = useRef(false);
  const [dashboardCloseCount, setDashboardCloseCount] = useState(0);
  const prevShowDashboardRef = useRef(false);

  useEffect(() => {
    let t1, t2, t3;
    if (prevShowDashboardRef.current && !showDashboard) {
      setDashboardCloseCount((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "instant" });
      t1 = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
      t2 = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 50);
      t3 = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 150);
    }
    prevShowDashboardRef.current = showDashboard;
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [showDashboard]);

  // ── Lottie loader: shown on every page refresh for 1.5 s ────────────────
  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Prevent scrollbar visibility and scrolling when loaders are active
  useEffect(() => {
    if (initialLoading || showLoader) {
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
  }, [initialLoading, showLoader]);

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
      })
      .catch(() => {
        // Token invalid/expired — clear it so the UI doesn't keep retrying.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  }, []);

  // Guard the login-gated routes: a direct/bookmarked/stale link to any of
  // these without a stored token bounces back to the login modal instead of
  // rendering a broken overlay.
  useEffect(() => {
    const needsAuth = showApply || showJobApplicationModal || showDashboard;
    if (needsAuth && !localStorage.getItem("accessToken")) {
      toast.error("Please log in to continue.");
      navigate(routes.login, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Resolve the job for /jobs/:jobId/apply when it wasn't handed to us via
  // handleApplyJob (direct link, or a hard refresh while the modal was open).
  useEffect(() => {
    if (!jobApplyMatch) return;
    const jobId = jobApplyMatch.params.jobId;
    if (selectedJob && String(selectedJob.id) === String(jobId)) return;

    let cancelled = false;
    fetchPublicJobs()
      .then((jobs) => {
        if (cancelled) return;
        const found = jobs.find((j) => String(j.id) === String(jobId));
        if (found) {
          setSelectedJob(found);
        } else {
          toast.error("That job posting is no longer available.");
          navigate(routes.home, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) navigate(routes.home, { replace: true });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobApplyMatch?.params.jobId]);

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
    navigate(tab === "signup" ? routes.loginSignup : routes.login);
  };

  // Job apply: if not logged in show login modal directly.
  const handleApplyJob = (job) => {
    if (!loggedInUser) {
      openModal("login");
      return;
    }
    setSelectedJob(job);
    navigate(routes.jobApply(job.id));
  };

  // General application / Submit Profile — open signup modal directly.
  const handleSignup = () => {
    setApplyAfterSignup(true);
    openModal("signup");
  };

  const handleOpenDashboard = () => {
    setCameFromApply(false);
    navigate(routes.dashboard);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setLogoutLoading(true);
    setShowLoader(true);

    setLoggedInUser("");
    navigate(routes.home);
    setCameFromApply(false);
    setCameFromSection(undefined);
    dashboardLoadedOnceRef.current = false;

    if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
    loaderTimerRef.current = setTimeout(() => {
      setShowLoader(false);
      setLogoutLoading(false);
    }, 1500);
  };

  const mergedProfileData = useMemo(
    () => buildMergedProfileData({ savedProfileData, applicationDraft, signupData, loggedInUser }),
    [savedProfileData, applicationDraft, signupData, loggedInUser],
  );


  // Everything the overlay modals need to read and mutate.
  const modalApp = {
    deferredView,
    loginTab,
    applyAfterSignup,
    cameFromApply,
    cameFromSection,
    loggedInUser,
    signupData,
    appliedJobIds,
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
    // Allows form submit handlers inside modals to trigger the branded loader
    setShowLoader,
    initialLoading,
    dashboardLoadedOnce: dashboardLoadedOnceRef.current,
    setDashboardLoadedOnce: (val) => { dashboardLoadedOnceRef.current = val; },
  };

  return (
    <>
      {/* Career page renders immediately if dashboard is active, or waits for Lottie loader / logout loader to finish so its entry animations trigger visible to the user */}
      {((!initialLoading && !logoutLoading) || showDashboard) && (
        <CareerPage
          key={`${loggedInUser ? "logged-in" : "guest"}-${dashboardCloseCount}`}
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
