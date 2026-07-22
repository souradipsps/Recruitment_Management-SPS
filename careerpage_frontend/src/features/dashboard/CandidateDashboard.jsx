import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useMatch } from "react-router-dom";
import { Menu, Bell, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import logoImg from "../../assets/logo.png";

import { MAROON, GOLD } from "../../lib/constants";
import { routes } from "../../routes";
import { updateUserProfile, fetchMyJobApplications } from "../careerpage/services/applicationsService";
import { fetchPublicJobs } from "../careerpage/services/jobsService";
import { fetchMyOffers, acceptOffer, declineOffer, fetchMyOnboardingRecord, submitOnboardingDocuments } from "../careerpage/services/offersService";
import { fetchUpcomingInterviews } from "../careerpage/services/interviewsService";
import { fetchMyNotifications, markAllNotificationsRead } from "../careerpage/services/notificationsService";

// Layout
import { DashboardSidebar } from "./components/layout/DashboardSidebar";

// Tab sections
import { OverviewSection } from "./components/sections/OverviewSection";
import { ApplicationsSection } from "./components/sections/ApplicationsSection";
import { ProfileSection } from "./components/sections/ProfileSection";
import { SecuritySection } from "./components/sections/SecuritySection";
import { InterviewsSection } from "./components/sections/InterviewsSection";
import { OnboardingSection } from "./components/sections/OnboardingSection";
import { NotificationsSection } from "./components/sections/NotificationsSection";

// Popups & overlays
import { CameraModal } from "./components/popup/CameraModal";
import { ProfilePicturePopup } from "./components/popup/ProfilePicturePopup";
import { JobDescriptionDrawer } from "./components/popup/JobDescriptionDrawer";
import { UnsavedChangesModal } from "./components/popup/UnsavedChangesModal";


// `profile.experience` holds the backend's raw choice code (e.g. "3-5") since
// that's what the select's `value` now is — this maps it back to a friendly
// label for read-only display (e.g. the generated resume preview).
const EXPERIENCE_LABELS = {
  "0-1": "0–1 years (Fresher)",
  "1-2": "1–2 years",
  "2-4": "2–4 years",
  "3-5": "3–5 years",
  "5-8": "5–8 years",
  "8+": "8+ years",
};

export function CandidateDashboard({
  onClose,
  userName = "Candidate",
  signupData,
  onLogout,
  initialProfileData,
  initialSection,
  onProfileUpdate,
  cameFromApply = false,
  initialLoading = false,
  dashboardLoadedOnce = false,
  setDashboardLoadedOnce = () => { },
}) {
  // Navigation & UI state — the active tab is the URL (/dashboard/:tab), so
  // switching tabs is a real navigation: deep-linkable, refresh-safe, and the
  // browser back button steps through tab history for free.
  const navigate = useNavigate();
  // No <Routes>/<Route> tree exists in this app (see routes.js) — useParams()
  // only reads from a matched Route's context, so it'd always be empty here.
  // useMatch() matches the current URL against an arbitrary pattern instead.
  const dashboardTabMatch = useMatch(routes.dashboardTabPattern);
  const activeTab = dashboardTabMatch?.params.tab || "dashboard";
  const setActiveTab = (tab) => navigate(routes.dashboardTab(tab));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJobDesc, setSelectedJobDesc] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // If the dashboard hasn't loaded once, or if the main Lottie loader is still active, show skeleton loading
  const [loading, setLoading] = useState(() => !dashboardLoadedOnce || initialLoading);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (dashboardLoadedOnce) return;
    if (initialLoading) {
      setLoading(true);
      return;
    }
    // Once initial page Lottie loader finishes, trigger the 800ms dashboard skeleton loading
    const timer = setTimeout(() => {
      setLoading(false);
      setDashboardLoadedOnce(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [initialLoading, dashboardLoadedOnce]);

  // Profile data states
  const [profile, setProfile] = useState({
    name: initialProfileData?.fullName
      ? initialProfileData.fullName.trim().split(" ")[0]
      : (signupData?.name || userName),
    lastName: initialProfileData?.fullName
      ? initialProfileData.fullName.trim().split(" ").slice(1).join(" ")
      : (signupData?.lastName || ""),
    email: signupData?.email || "",
    phone: initialProfileData?.phone ?? (signupData?.phone || ""),
    location: initialProfileData?.location ?? "Guwahati, Assam",
    highestEducation: initialProfileData?.education ?? "",
    degreeName: initialProfileData?.degreeName ?? "",
    professionalQualification: initialProfileData?.professionalQualification ?? "",
    professionalQualificationOther: initialProfileData?.professionalQualificationOther ?? "",
    experience: initialProfileData?.experience ?? "",
    salary: initialProfileData?.salary ?? "",
    extracurricular: initialProfileData?.extracurricular ?? "",
    extracurricularOther: initialProfileData?.extracurricularOther ?? "",
    roles: initialProfileData?.selectedRoles ?? [],
    skills: initialProfileData?.selectedSkills ?? [],
    linkedin: initialProfileData?.linkedin ?? "",
    portfolio: initialProfileData?.portfolio ?? "",
  });

  const [profilePic, setProfilePic] = useState(initialProfileData?.profilePicture || null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [lastSavedProfile, setLastSavedProfile] = useState({
    name: initialProfileData?.fullName
      ? initialProfileData.fullName.trim().split(" ")[0]
      : (signupData?.name || userName),
    lastName: initialProfileData?.fullName
      ? initialProfileData.fullName.trim().split(" ").slice(1).join(" ")
      : (signupData?.lastName || ""),
    email: signupData?.email || "",
    phone: initialProfileData?.phone ?? (signupData?.phone || ""),
    location: initialProfileData?.location ?? "Guwahati, Assam",
    highestEducation: initialProfileData?.highestEducation ?? initialProfileData?.education ?? "",
    degreeName: initialProfileData?.degreeName ?? "",
    professionalQualification: initialProfileData?.professionalQualification ?? "",
    professionalQualificationOther: initialProfileData?.professionalQualificationOther ?? "",
    experience: initialProfileData?.experience ?? "",
    salary: initialProfileData?.salary ?? "",
    extracurricular: initialProfileData?.extracurricular ?? "",
    extracurricularOther: initialProfileData?.extracurricularOther ?? "",
    roles: initialProfileData?.selectedRoles ?? [],
    skills: initialProfileData?.selectedSkills ?? [],
    linkedin: initialProfileData?.linkedin ?? "",
    portfolio: initialProfileData?.portfolio ?? "",
    resumeFile: initialProfileData?.resumeFile || null,
  });

  const hasUnsavedChanges = () => {
    const keys = Object.keys(profile);
    for (const key of keys) {
      const currentVal = profile[key];
      const savedVal = lastSavedProfile[key];

      if (Array.isArray(currentVal)) {
        if (!Array.isArray(savedVal) || currentVal.length !== savedVal.length || currentVal.some((v, i) => v !== savedVal[i])) {
          return true;
        }
      } else {
        if ((currentVal || "") !== (savedVal || "")) {
          return true;
        }
      }
    }
    if ((resumeFile || "") !== (lastSavedProfile.resumeFile || "")) {
      return true;
    }
    return false;
  };

  // Resume states
  const [resumeFile, setResumeFile] = useState(initialProfileData?.resumeFile || null);
  const [resumeUrl, setResumeUrl] = useState(initialProfileData?.resumeUrl || null);
  // The actual File object for a newly-picked resume this session (null if the
  // candidate hasn't chosen a new file — resumeFile/resumeUrl above only track
  // the display name / local preview URL, not something we can re-upload).
  const [resumeFileObj, setResumeFileObj] = useState(null);
  const [fileSizeError, setFileSizeError] = useState("");

  // Refs for auto-scrolling
  const personalSectionRef = useRef(null);
  const professionalSectionRef = useRef(null);
  const resumeSectionRef = useRef(null);
  const picRef = useRef(null);

  // Onboarding states
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [offerRejected, setOfferRejected] = useState(false);
  const [showOfferConfirm, setShowOfferConfirm] = useState(null);

  // Live offer letter (GET /api/offers/ — candidate sees only their own). The
  // accepted/rejected booleans above are derived from the offer's status so the
  // rest of the onboarding flow (doc upload, progress steps) keeps working.
  const [offer, setOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerActionLoading, setOfferActionLoading] = useState(false);
  const [docs, setDocs] = useState({});
  const [docUrls, setDocUrls] = useState({});
  // The actual File/Blob objects behind `docs` (which only holds display names) —
  // this is what actually gets uploaded in handleSubmitDocs.
  const [docFiles, setDocFiles] = useState({});
  const [docsSubmitted, setDocsSubmitted] = useState(false);
  const [docsSubmitting, setDocsSubmitting] = useState(false);

  // The candidate's own OnboardingRecord (auto-created server-side when they
  // accept their offer) — its backendId is what document uploads PATCH to.
  const [onboardingRecord, setOnboardingRecord] = useState(null);

  // Onboarding identity & bank form states
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [pfNumber, setPfNumber] = useState("");
  const [esiNumber, setEsiNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTargetDocKey, setCameraTargetDocKey] = useState(null);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);

  // Real job applications fetched from the backend (GET /api/applications/),
  // plus the live job postings so we can attach department/location/type —
  // the application record itself only carries the posting id/title, not the
  // full job listing.
  const [jobApplications, setJobApplications] = useState([]);
  const [liveJobs, setLiveJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);

  // Synchronize dynamic profile data asynchronously loaded from the backend
  useEffect(() => {
    if (initialProfileData) {
      const mappedProfile = {
        name: initialProfileData.fullName ? initialProfileData.fullName.trim().split(" ")[0] : (signupData?.name || userName),
        lastName: initialProfileData.fullName ? initialProfileData.fullName.trim().split(" ").slice(1).join(" ") : (signupData?.lastName || ""),
        email: initialProfileData.email || signupData?.email || "",
        phone: initialProfileData.phone || (signupData?.phone || ""),
        location: initialProfileData.location || "Guwahati, Assam",
        highestEducation: initialProfileData.education || "",
        degreeName: initialProfileData.degreeName || "",
        professionalQualification: initialProfileData.professionalQualification || "",
        professionalQualificationOther: initialProfileData.professionalQualificationOther || "",
        experience: initialProfileData.experience || "",
        salary: initialProfileData.salary || "",
        extracurricular: initialProfileData.extracurricular || "",
        extracurricularOther: initialProfileData.extracurricularOther || "",
        roles: initialProfileData.selectedRoles || [],
        skills: initialProfileData.selectedSkills || [],
        linkedin: initialProfileData.linkedin || "",
        portfolio: initialProfileData.portfolio || "",
      };

      const hasUnsaved = hasUnsavedChanges();
      const isInitial = !lastSavedProfile.email;

      if (isInitial || !hasUnsaved) {
        setProfile(mappedProfile);
        setLastSavedProfile({
          ...mappedProfile,
          resumeFile: initialProfileData.resumeFile || null,
        });
        setResumeFile(initialProfileData.resumeFile || null);
        setResumeUrl(initialProfileData.resumeUrl || null);
        setProfilePic(initialProfileData.profilePicture || null);
      }
    }
  }, [initialProfileData, signupData, userName]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMyJobApplications(), fetchPublicJobs()])
      .then(([applications, jobs]) => {
        if (cancelled) return;
        setJobApplications(applications);
        setLiveJobs(jobs);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || "Could not load your applications.");
      });
    return () => { cancelled = true; };
  }, []);

  // Real upcoming interviews (GET /api/interviews/, scoped to this candidate) —
  // the Overview stat card used to count applications with status "Interview
  // Scheduled", but that status string doesn't exist in the backend's
  // JobApplication.STATUS_CHOICES, so it always read 0. Fetch the real
  // interview records instead, same source InterviewsSection already uses.
  useEffect(() => {
    let cancelled = false;
    fetchUpcomingInterviews()
      .then((data) => { if (!cancelled) setInterviews(data); })
      .catch(() => { /* Overview stat just falls back to 0; the Interviews tab surfaces the real error. */ });
    return () => { cancelled = true; };
  }, []);

  // Load the candidate's offer letter and seed the accepted/rejected flags from
  // its status (so a returning candidate sees the correct onboarding state).
  useEffect(() => {
    let cancelled = false;
    setOfferLoading(true);
    fetchMyOffers()
      .then((offers) => {
        if (cancelled) return;
        const active = offers[0] ?? null; // newest first (see offersService)
        setOffer(active);
        if (active?.status === "Accepted") setOfferAccepted(true);
        if (active?.status === "Rejected") setOfferRejected(true);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || "Could not load your offer.");
      })
      .finally(() => { if (!cancelled) setOfferLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Seed local form state from a fetched OnboardingRecord. This is what makes a
  // page refresh (or any remount) show the candidate's *actual* submitted
  // documents/details instead of "Missing document" — docs/docUrls otherwise
  // only ever held whatever was picked in the current browser session, which is
  // empty after a reload even though task_docs_upload (and the real files) are
  // already true/saved on the backend.
  const applyOnboardingRecord = (record) => {
    setOnboardingRecord(record);
    if (!record) return;
    if (record.docsUploaded) setDocsSubmitted(true);
    if (Object.keys(record.uploadedDocNames).length) {
      setDocs((prev) => ({ ...prev, ...record.uploadedDocNames }));
      setDocUrls((prev) => ({ ...prev, ...record.uploadedDocUrls }));
    }
    setAadharNumber((prev) => prev || record.aadharNumber);
    setPanNumber((prev) => prev || record.panNumber);
    setPfNumber((prev) => prev || record.pfNumber);
    setEsiNumber((prev) => prev || record.esiNumber);
    setBankHolder((prev) => prev || record.bankHolderName);
    setBankAccount((prev) => prev || record.bankAccountNumber);
    setBankIfsc((prev) => prev || record.bankIfsc);
    setBankName((prev) => prev || record.bankName);
  };

  // Load the candidate's onboarding record (auto-created server-side once the
  // offer is accepted) so document uploads have somewhere to PATCH to, and so a
  // returning candidate who already submitted doesn't see the form again.
  useEffect(() => {
    if (!offerAccepted) return;
    let cancelled = false;
    fetchMyOnboardingRecord()
      .then((record) => {
        if (cancelled) return;
        applyOnboardingRecord(record);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || "Could not load your onboarding record.");
      });
    return () => { cancelled = true; };
  }, [offerAccepted]);

  // Re-fetch every time the candidate opens the Onboarding tab, so HR's
  // verification actions (visible immediately in the admin dashboard) show up
  // here too without needing a full page reload.
  useEffect(() => {
    if (activeTab !== "onboarding" || !offerAccepted) return;
    let cancelled = false;
    fetchMyOnboardingRecord()
      .then((record) => {
        if (cancelled) return;
        applyOnboardingRecord(record);
      })
      .catch(() => { /* silent — the on-accept fetch above already surfaced any real error */ });
    return () => { cancelled = true; };
  }, [activeTab, offerAccepted]);

  const handleAcceptOffer = async () => {
    if (!offer?.backendId) { setOfferAccepted(true); setShowOfferConfirm(null); return; }
    setOfferActionLoading(true);
    try {
      const updated = await acceptOffer(offer.backendId);
      setOffer(updated);
      setOfferAccepted(true);
      setShowOfferConfirm(null);
      toast.success("Offer accepted! You can now upload your documents.");
    } catch (err) {
      toast.error(err.message || "Could not accept the offer. Please try again.");
    } finally {
      setOfferActionLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!offer?.backendId) { setOfferRejected(true); setShowOfferConfirm(null); return; }
    setOfferActionLoading(true);
    try {
      const updated = await declineOffer(offer.backendId);
      setOffer(updated);
      setOfferRejected(true);
      setShowOfferConfirm(null);
      toast.success("Offer declined.");
    } catch (err) {
      toast.error(err.message || "Could not decline the offer. Please try again.");
    } finally {
      setOfferActionLoading(false);
    }
  };

  // Dynamic applications based on the candidate's real submitted applications.
  const dynamicApplications = useMemo(() => {
    return jobApplications.map((app) => {
      const liveJob = liveJobs.find((j) => j.id === app.posting);
      return {
        id: app.posting ?? app.id,
        title: app.posting_title || app.role || "Untitled Position",
        department: liveJob?.department || "General",
        location: liveJob?.location || "",
        type: liveJob?.type || "",
        appliedDate: app.applied_date
          ? new Date(app.applied_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          : "",
        status: app.status || "Applied",
      };
    });
  }, [jobApplications, liveJobs]);

  const [dashboardNotifications, setDashboardNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchMyNotifications()
      .then((data) => { if (!cancelled) setDashboardNotifications(data); })
      .catch(() => { /* silent fallback */ });
    return () => { cancelled = true; };
  }, []);

  const unreadCount = dashboardNotifications.filter((n) => !n.read).length;

  // Lock body scroll while dashboard is open so the page behind cannot scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (activeTab === "notifications") {
      setDashboardNotifications((prev) =>
        prev.map((n) => (n.read ? n : { ...n, read: true }))
      );
      markAllNotificationsRead().catch((err) => {
        console.error("Failed to mark all notifications read on backend:", err);
      });
    }
  }, [activeTab]);

  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current === "notifications" && activeTab !== "notifications") {
      setDashboardNotifications((prev) =>
        prev.map((n) => (n.isNew ? { ...n, isNew: false } : n))
      );
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  // Handles auto scrolling to specific sections in Profile — fires after loading completes
  useEffect(() => {
    if (loading || activeTab !== "resume" || !initialSection) return;
    const timer = setTimeout(() => {
      if (initialSection === "personal") {
        personalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (initialSection === "professional") {
        professionalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (initialSection === "resume") {
        resumeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loading]);

  // Keep refs in sync for popstate navigation logic
  const activeTabRef = useRef(activeTab);
  const selectedJobDescRef = useRef(selectedJobDesc);
  const sidebarOpenRef = useRef(sidebarOpen);
  const unsavedChangesRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const cameFromApplyRef = useRef(cameFromApply);

  // Swipe-back gesture refs (mobile)
  const swipeTouchStartX = useRef(null);
  const swipeTouchStartY = useRef(null);
  const swipeTouchStartTime = useRef(null);

  const handleSwipeTouchStart = (e) => {
    swipeTouchStartX.current = e.touches[0].clientX;
    swipeTouchStartY.current = e.touches[0].clientY;
    swipeTouchStartTime.current = Date.now();
  };

  const handleSwipeTouchCancel = () => {
    swipeTouchStartX.current = null;
    swipeTouchStartY.current = null;
    swipeTouchStartTime.current = null;
  };

  const handleSwipeTouchEnd = (e) => {
    const startX = swipeTouchStartX.current;
    const startY = swipeTouchStartY.current;
    const startTime = swipeTouchStartTime.current;
    swipeTouchStartX.current = null;
    swipeTouchStartY.current = null;
    swipeTouchStartTime.current = null;

    if (startX === null) return;
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - startY);
    const elapsed = Date.now() - startTime;

    // iOS owns 0-~20px for its native back gesture (fires popstate, not touchend).
    // Cover 0-80px so the remaining ~20-80px zone is reliably reachable on all devices.
    // Require ≥60px rightward travel and more horizontal than vertical.
    if (startX > 80 || deltaX < 60 || deltaY > deltaX * 0.8) return;

    // Velocity > 0.5 px/ms (500 px/s) = hard swipe → exit dashboard immediately.
    // This eliminates the flicker: a fast swipe never mutates tab state before
    // popstate can see it with a stale "dashboard" value and close the portal.
    const isHardSwipe = elapsed > 0 && (deltaX / elapsed) > 0.5;

    const currentTab = activeTabRef.current;
    const currentJobDesc = selectedJobDescRef.current;
    const currentSidebarOpen = sidebarOpenRef.current;

    if (currentJobDesc) {
      setSelectedJobDesc(null);
    } else if (currentSidebarOpen) {
      setSidebarOpen(false);
    } else if (isHardSwipe) {
      // Hard swipe: exit dashboard immediately from any section
      if (unsavedChangesRef.current) {
        setPendingNavigation({ type: "close", bypassApplyModal: true });
      } else {
        onCloseRef.current(true);
      }
    } else {
      // Soft swipe: one step back
      if (cameFromApplyRef.current) {
        if (currentTab !== "resume") {
          setActiveTab("resume");
        } else if (unsavedChangesRef.current) {
          setPendingNavigation({ type: "close", bypassApplyModal: false });
        } else {
          onCloseRef.current(false);
        }
      } else {
        if (currentTab !== "dashboard") {
          if (currentTab === "resume" && unsavedChangesRef.current) {
            setPendingNavigation({ type: "tab", targetId: "dashboard" });
          } else {
            setActiveTab("dashboard");
          }
        } else {
          onCloseRef.current(true);
        }
      }
    }
  };

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedJobDescRef.current = selectedJobDesc; }, [selectedJobDesc]);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { cameFromApplyRef.current = cameFromApply; }, [cameFromApply]);

  const unsaved = hasUnsavedChanges();
  useEffect(() => {
    unsavedChangesRef.current = unsaved;
  }, [unsaved]);

  // Physical back button / Android back: tab switches are now real routes, so
  // the browser already steps back through tab history on its own. The only
  // thing left to intercept here is UI that never gets its own URL — the job
  // description drawer and the mobile sidebar. Push a throwaway history entry
  // while either is open so back closes it instead of leaving the dashboard;
  // pop it again once both are closed (however they closed).
  useEffect(() => {
    if (!selectedJobDesc && !sidebarOpen) return;

    window.history.pushState({ portal: "candidate-dashboard-overlay" }, "");
    const handlePopState = () => {
      if (selectedJobDescRef.current) setSelectedJobDesc(null);
      else if (sidebarOpenRef.current) setSidebarOpen(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.portal === "candidate-dashboard-overlay") {
        window.history.back();
      }
    };
  }, [selectedJobDesc, sidebarOpen]);

  // In-app tab switches (sidebar clicks, the top-bar Back button, swipe
  // gestures) already check hasUnsavedChanges() before calling setActiveTab,
  // so they never land here. The only way to leave "resume" with unsaved
  // changes while this effect sees it is the physical back/forward button —
  // by the time popstate fires the URL (and activeTab) has already changed,
  // so instead of blocking the navigation we react to it: send the user back
  // to resume and ask what to do, the same prompt every other exit uses.
  const prevTabForBackGuardRef = useRef(activeTab);
  useEffect(() => {
    const cameFrom = prevTabForBackGuardRef.current;
    prevTabForBackGuardRef.current = activeTab;
    if (cameFrom === "resume" && activeTab !== "resume" && unsavedChangesRef.current) {
      setPendingNavigation({ type: "restoreResumeTab" });
    }
  }, [activeTab]);

  // Reset profile and resume state changes on cancellation
  const revertUnsavedChanges = () => {
    setProfile({
      name: lastSavedProfile.name,
      lastName: lastSavedProfile.lastName,
      email: lastSavedProfile.email,
      phone: lastSavedProfile.phone,
      location: lastSavedProfile.location,
      highestEducation: lastSavedProfile.highestEducation,
      degreeName: lastSavedProfile.degreeName,
      professionalQualification: lastSavedProfile.professionalQualification,
      professionalQualificationOther: lastSavedProfile.professionalQualificationOther,
      experience: lastSavedProfile.experience,
      salary: lastSavedProfile.salary,
      extracurricular: lastSavedProfile.extracurricular,
      extracurricularOther: lastSavedProfile.extracurricularOther,
      roles: lastSavedProfile.roles,
      skills: lastSavedProfile.skills,
      linkedin: lastSavedProfile.linkedin,
      portfolio: lastSavedProfile.portfolio,
    });
    setResumeFile(lastSavedProfile.resumeFile);
    setResumeUrl(initialProfileData?.resumeUrl || null);
    setResumeFileObj(null);
  };

  // Execute a pending navigation action after the unsaved-changes prompt resolves
  const proceedNavigation = (action) => {
    if (!action) return;
    if (action.type === "tab" && action.targetId) {
      setActiveTab(action.targetId);
      setSidebarOpen(false);
    } else if (action.type === "close") {
      onClose(action.bypassApplyModal);
    } else if (action.type === "logout") {
      onLogout?.();
    }
  };

  const syncProfilePicToBackend = async (dataUrl) => {
    try {
      await updateUserProfile({
        ...initialProfileData,
        profilePicture: dataUrl,
      });
      onProfileUpdate?.({
        ...initialProfileData,
        profilePicture: dataUrl,
      });
    } catch (err) {
      console.error("Failed to sync profile picture to backend:", err);
    }
  };

  // Profile picture camera/file triggers
  const handlePhotoUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        setProfilePic(dataUrl);
        setShowPhotoPopup(false);
        await syncProfilePicToBackend(dataUrl);
      };
      reader.readAsDataURL(f);
    }
  };

  // Resume file uploads
  const handleResumeUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setFileSizeError("File exceeds 5 MB limit. Please upload a smaller file.");
      return;
    }
    setFileSizeError("");
    if (resumeUrl) URL.revokeObjectURL(resumeUrl);
    setResumeFile(f.name);
    setResumeUrl(URL.createObjectURL(f));
    setResumeFileObj(f);
  };

  // Open dynamic resume preview
  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
      return;
    }

    const fullName = [profile.name, profile.lastName].filter(Boolean).join(" ") || "Candidate Profile";
    const email = profile.email || "candidate@example.com";
    const phone = profile.phone || "Not provided";
    const locationVal = profile.location || "Not provided";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume Preview - ${resumeFile || "Resume"}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              background-color: #f3f4f6;
              margin: 0;
              padding: 40px 20px;
              color: #1f2937;
              line-height: 1.5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              padding: 50px 60px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              border-radius: 12px;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #72102a;
              padding-bottom: 25px;
              margin-bottom: 30px;
            }
            .name {
              font-size: 32px;
              font-weight: 800;
              color: #72102a;
              margin: 0 0 5px 0;
            }
            .subtitle {
              font-size: 15px;
              color: #c9a84c;
              text-transform: uppercase;
              letter-spacing: 2px;
              font-weight: 600;
              margin: 0 0 15px 0;
            }
            .contact-info {
              display: flex;
              justify-content: center;
              gap: 20px;
              font-size: 13px;
              color: #4b5563;
              flex-wrap: wrap;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: #72102a;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
              margin-bottom: 15px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .meta-item {
              margin-bottom: 12px;
            }
            .meta-label {
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              color: #9ca3af;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            .meta-value {
              font-size: 14px;
              font-weight: 500;
              color: #111827;
            }
            .tag {
              display: inline-block;
              background-color: #f3f4f6;
              color: #374151;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 13px;
              margin-right: 6px;
              margin-bottom: 6px;
              font-weight: 500;
            }
            .alert-banner {
              background-color: #fef3c7;
              border: 1px solid #fcd34d;
              color: #92400e;
              padding: 12px;
              border-radius: 8px;
              font-size: 12px;
              text-align: center;
              margin-top: 40px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="name">${fullName}</div>
              <div class="subtitle">Candidate Profile & Resume</div>
              <div class="contact-info">
                <span>✉ ${email}</span>
                <span>📞 ${phone}</span>
                <span>📍 ${locationVal}</span>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Educational & Professional Background</div>
              <div class="grid-2">
                <div class="meta-item">
                  <div class="meta-label">Highest Qualification</div>
                  <div class="meta-value">${profile.highestEducation || "Not specified"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Degree Name</div>
                  <div class="meta-value">${profile.degreeName || "Not specified"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Professional Qualification</div>
                  <div class="meta-value">${profile.professionalQualification === "Other"
        ? profile.professionalQualificationOther || "Other Qualification"
        : profile.professionalQualification || "None"
      }</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Years of Experience</div>
                  <div class="meta-value">${EXPERIENCE_LABELS[profile.experience] || "None"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Expected Salary</div>
                  <div class="meta-value">${profile.salary || "Not specified"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Extracurricular Activities</div>
                  <div class="meta-value">${profile.extracurricular === "Other"
        ? profile.extracurricularOther || "Other Activities"
        : profile.extracurricular || "None"
      }</div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Interested Roles</div>
              <div>
                ${profile.roles && profile.roles.length > 0
        ? profile.roles.map((role) => `<span class="tag">${role}</span>`).join("")
        : '<span style="color: #9ca3af; font-style: italic; font-size: 14px;">No roles selected</span>'
      }
              </div>
            </div>
            <div class="section">
              <div class="section-title">Skills</div>
              <div>
                ${profile.skills && profile.skills.length > 0
        ? profile.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")
        : '<span style="color: #9ca3af; font-style: italic; font-size: 14px;">No skills listed</span>'
      }
              </div>
            </div>
            ${profile.linkedin || profile.portfolio
        ? `
            <div class="section">
              <div class="section-title">Professional Links</div>
              <div class="grid-2">
                ${profile.linkedin
          ? `
                <div class="meta-item">
                  <div class="meta-label">LinkedIn Profile</div>
                  <div class="meta-value"><a href="${profile.linkedin.startsWith("http") ? profile.linkedin : "https://" + profile.linkedin
          }" target="_blank" style="color: #72102a; text-decoration: none; font-weight: 600;">${profile.linkedin} ↗</a></div>
                </div>`
          : ""
        }
                ${profile.portfolio
          ? `
                <div class="meta-item">
                  <div class="meta-label">Portfolio URL</div>
                  <div class="meta-value"><a href="${profile.portfolio.startsWith("http") ? profile.portfolio : "https://" + profile.portfolio
          }" target="_blank" style="color: #72102a; text-decoration: none; font-weight: 600;">${profile.portfolio} ↗</a></div>
                </div>`
          : ""
        }
              </div>
            </div>`
        : ""
      }
            <div class="alert-banner">
              This is a generated mockup preview representing the uploaded file: <strong>${resumeFile}</strong>.
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Profile verification & save changes
  const handleSave = async () => {
    if (!profile.phone || profile.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }

    setSaving(true);
    try {
      await updateUserProfile(
        {
          firstName: profile.name, lastName: profile.lastName, phone: profile.phone,
          email: profile.email,
          location: profile.location, education: profile.highestEducation, degreeName: profile.degreeName,
          professionalQualification: profile.professionalQualification,
          professionalQualificationOther: profile.professionalQualificationOther,
          experience: profile.experience, salary: profile.salary,
          selectedRoles: profile.roles, selectedSkills: profile.skills,
          linkedin: profile.linkedin, portfolio: profile.portfolio,
          extracurricular: profile.extracurricular, extracurricularOther: profile.extracurricularOther,
          profilePicture: profilePic,
        },
        resumeFileObj,
      );
    } catch (err) {
      toast.error(err.message || "Could not save your profile. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }

    setSaved(true);
    toast.success("Profile changes saved successfully!", { duration: 2000 });
    const updatedData = {
      fullName: [profile.name, profile.lastName].filter(Boolean).join(" "),
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      education: profile.highestEducation || "",
      degreeName: profile.degreeName || "",
      professionalQualification: profile.professionalQualification || "",
      professionalQualificationOther: profile.professionalQualificationOther || "",
      experience: profile.experience || "",
      salary: profile.salary || "",
      extracurricular: profile.extracurricular || "",
      extracurricularOther: profile.extracurricularOther || "",
      selectedRoles: profile.roles || [],
      selectedSkills: profile.skills || [],
      linkedin: profile.linkedin || "",
      portfolio: profile.portfolio || "",
      resumeFile: resumeFile || "",
      resumeUrl: resumeUrl || "",
      profilePicture: profilePic,
    };
    onProfileUpdate?.(updatedData);
    setLastSavedProfile({
      ...profile,
      resumeFile: resumeFile,
    });
    setResumeFileObj(null);
    setTimeout(() => setSaved(false), 2000);
    return true;
  };

  // Onboarding documents submission validation
  // Maps the onboarding UI's document keys onto the backend OnboardingRecord's
  // file field names (see rms_backend/onboarding/models.py).
  const DOC_KEY_TO_BACKEND_FIELD = {
    aadhar: "aadhar_card",
    pan: "pan_card",
    bank_details: "bank_passbook",
    photo: "passport_photo",
    driving_license: "driving_license",
    class10: "class10_marksheet",
    class12: "class12_marksheet",
    degree: "degree_certificate",
    experience_cert: "experience_certificate",
    prof_cert: "professional_certificate",
  };

  const handleSubmitDocs = async () => {
    const requiredKeys = ["aadhar", "pan", "bank_details", "photo"];
    const missing = requiredKeys.filter((k) => !docs[k]);
    if (missing.length > 0) {
      const getFriendlyName = (k) => {
        switch (k) {
          case "aadhar": return "Aadhaar Card";
          case "class10": return "Class 10 Marksheet";
          case "class12": return "Class 12 Marksheet";
          case "degree": return "Degree Certificate";
          case "photo": return "Passport Size Photo";
          case "pan": return "PAN Card";
          case "bank_details": return "Bank Details";
          case "experience_cert": return "Experience Certificate";
          case "driving_license": return "Driving License";
          case "prof_cert": return "Professional Certificate";
          default: return k;
        }
      };
      toast.error(`Please upload required documents. Missing: ${missing.map(getFriendlyName).join(", ")}`);
      return;
    }
    if (aadharNumber.replace(/\s/g, "").length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      toast.error("Please enter a valid 10-character PAN number");
      return;
    }
    if (!bankAccount.trim() || !bankIfsc.trim() || !bankName.trim() || !bankHolder.trim()) {
      toast.error("Please fill all bank details (Account Number, IFSC, Bank Name, Holder Name)");
      return;
    }
    if (!onboardingRecord?.backendId) {
      toast.error("Your onboarding record isn't ready yet. Please refresh and try again.");
      return;
    }

    const files = {};
    Object.entries(DOC_KEY_TO_BACKEND_FIELD).forEach(([docKey, backendField]) => {
      if (docFiles[docKey]) files[backendField] = docFiles[docKey];
    });

    setDocsSubmitting(true);
    try {
      const updated = await submitOnboardingDocuments(
        onboardingRecord.backendId,
        {
          aadhar_number: aadharNumber.replace(/\s/g, ""),
          pan_number: panNumber,
          pf_number: pfNumber,
          esi_number: esiNumber,
          bank_holder_name: bankHolder,
          bank_account_number: bankAccount,
          bank_ifsc: bankIfsc,
          bank_name: bankName,
        },
        files,
      );
      setOnboardingRecord(updated);
      setDocsSubmitted(true);
      toast.success("Documents submitted successfully!");
    } catch (err) {
      toast.error(err.message || "Could not submit your documents. Please try again.");
    } finally {
      setDocsSubmitting(false);
    }
  };

  // Doc camera helper
  const startDocCamera = (docKey) => {
    setCameraTargetDocKey(docKey);
    setCameraOpen(true);
  };

  // "data:image/jpeg;base64,..." -> a real File object, so camera captures can
  // be uploaded the same way as a picked file.
  const dataUrlToFile = (dataUrl, filename) => {
    const [header, base64] = dataUrl.split(",");
    const mime = /:(.*?);/.exec(header)?.[1] || "image/jpeg";
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  };

  // Photo captured callback from CameraModal
  const handlePhotoCapture = async (dataUrl, targetKey) => {
    if (targetKey) {
      const filename = `Captured_${targetKey}.jpg`;
      setDocs((prev) => ({ ...prev, [targetKey]: filename }));
      setDocUrls((prev) => ({ ...prev, [targetKey]: dataUrl }));
      setDocFiles((prev) => ({ ...prev, [targetKey]: dataUrlToFile(dataUrl, filename) }));
    } else {
      setProfilePic(dataUrl);
      await syncProfilePicToBackend(dataUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      onTouchStart={handleSwipeTouchStart}
      onTouchEnd={handleSwipeTouchEnd}
      onTouchCancel={handleSwipeTouchCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navbar */}
      <div
        style={{
          background: MAROON,
          padding: "0 24px",
          height: "76px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              padding: "4px",
            }}
          >
            <Menu size={20} />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => {
              if (activeTab === "resume" && hasUnsavedChanges()) {
                setPendingNavigation({ type: "close", bypassApplyModal: true });
              } else {
                onClose(true);
              }
            }}
          >
            <img
              src={logoImg}
              alt="South Point School"
              style={{ height: "44px", objectFit: "contain" }}
            />
            <div>
              <div
                style={{
                  color: GOLD,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.2,
                }}
              >
                South Point School
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.15em",
                }}
              >
                CANDIDATE PORTAL
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => {
              if (activeTab === "resume" && hasUnsavedChanges()) {
                setPendingNavigation({ type: "tab", targetId: "notifications" });
              } else {
                setActiveTab("notifications");
              }
            }}
          >
            <Bell
              size={18}
              color="rgba(255,255,255,0.8)"
            />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: GOLD,
                  color: "#1a0a0a",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: "15px",
                  height: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (activeTab === "resume" && hasUnsavedChanges()) {
                if (cameFromApply) {
                  setPendingNavigation({ type: "close", bypassApplyModal: false });
                } else {
                  setPendingNavigation({ type: "tab", targetId: "dashboard" });
                }
              } else if (cameFromApply) {
                if (activeTab !== "resume") {
                  setActiveTab("resume");
                } else {
                  onClose(false);
                }
              } else if (activeTab !== "dashboard") {
                setActiveTab("dashboard");
              } else {
                onClose(true);
              }
            }}
            className="hidden sm:flex"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "6px",
              padding: "5px 12px",
              cursor: "pointer",
              alignItems: "center",
              gap: "6px",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            <ChevronLeft size={14} color="#fff" /> Back
          </button>
        </div>
      </div>

      {/* Main Layout Container */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Mobile Sidebar backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                top: "76px",
                zIndex: 998,
                background: "rgba(0,0,0,0.4)",
              }}
              className="md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <DashboardSidebar
          profile={profile}
          profilePic={profilePic}
          activeTab={activeTab}
          hasUnsavedChanges={hasUnsavedChanges()}
          unreadCount={unreadCount}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveTab={setActiveTab}
          setPendingNavigation={setPendingNavigation}
          setShowPhotoPopup={setShowPhotoPopup}
          onLogout={onLogout}
          loading={loading}
        />

        {/* Main Content Area */}
        <main
          onClick={() => sidebarOpen && setSidebarOpen(false)}
          style={{
            flex: 1,
            overflowY: "auto",
          }}
          className="p-4 md:p-6"
        >
          {loading ? (
            activeTab === "dashboard" ? (
              <div>
                <div className="skeleton animate-pulse" style={{ width: 220, height: 28, marginBottom: 8 }} />
                <div className="skeleton animate-pulse" style={{ width: 340, height: 16, marginBottom: 24 }} />
                <div className="ov-stats-grid">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="ov-stat-card">
                      <div className="skeleton animate-pulse" style={{ width: 40, height: 32, marginBottom: 8, marginLeft: "auto", marginRight: "auto" }} />
                      <div className="skeleton animate-pulse" style={{ width: 80, height: 16, marginLeft: "auto", marginRight: "auto" }} />
                    </div>
                  ))}
                </div>
                <div className="ov-recent-card" style={{ marginTop: 24 }}>
                  <div className="ov-recent-header" style={{ marginBottom: 16 }}>
                    <div className="skeleton animate-pulse" style={{ width: 150, height: 24 }} />
                  </div>
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e5e7eb" }}>
                      <div>
                        <div className="skeleton animate-pulse" style={{ width: 180, height: 18, marginBottom: 6 }} />
                        <div className="skeleton animate-pulse" style={{ width: 120, height: 14 }} />
                      </div>
                      <div className="skeleton animate-pulse" style={{ width: 90, height: 24, borderRadius: 12 }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === "applications" ? (
              <div>
                <div className="skeleton animate-pulse" style={{ width: 200, height: 28, marginBottom: 8 }} />
                <div className="skeleton animate-pulse" style={{ width: 280, height: 16, marginBottom: 24 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="skeleton animate-pulse" style={{ width: 200, height: 18, marginBottom: 8 }} />
                        <div className="skeleton animate-pulse" style={{ width: 140, height: 14 }} />
                      </div>
                      <div className="skeleton animate-pulse" style={{ width: 100, height: 32, borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === "resume" ? (
              <div>
                <div className="skeleton animate-pulse" style={{ width: 220, height: 28, marginBottom: 8 }} />
                <div className="skeleton animate-pulse" style={{ width: 340, height: 16, marginBottom: 24 }} />

                {/* Personal Information Card Skeleton */}
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 20 }}>
                  <div className="skeleton animate-pulse" style={{ width: 180, height: 22, marginBottom: 20 }} />
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    <div>
                      <div className="skeleton animate-pulse" style={{ width: 80, height: 12, marginBottom: 8 }} />
                      <div className="skeleton animate-pulse" style={{ width: "100%", height: 38, borderRadius: 6 }} />
                    </div>
                    <div>
                      <div className="skeleton animate-pulse" style={{ width: 80, height: 12, marginBottom: 8 }} />
                      <div className="skeleton animate-pulse" style={{ width: "100%", height: 38, borderRadius: 6 }} />
                    </div>
                    <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                      <div className="skeleton animate-pulse" style={{ width: 100, height: 12, marginBottom: 8 }} />
                      <div style={{ display: "flex", gap: 12 }}>
                        <div className="skeleton animate-pulse" style={{ flex: 1, height: 38, borderRadius: 6 }} />
                        <div className="skeleton animate-pulse" style={{ width: 120, height: 38, borderRadius: 6 }} />
                      </div>
                    </div>
                    <div>
                      <div className="skeleton animate-pulse" style={{ width: 100, height: 12, marginBottom: 8 }} />
                      <div className="skeleton animate-pulse" style={{ width: "100%", height: 38, borderRadius: 6 }} />
                    </div>
                    <div>
                      <div className="skeleton animate-pulse" style={{ width: 110, height: 12, marginBottom: 8 }} />
                      <div className="skeleton animate-pulse" style={{ width: "100%", height: 38, borderRadius: 6 }} />
                    </div>
                  </div>
                </div>

                {/* Professional Information Card Skeleton */}
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 20 }}>
                  <div className="skeleton animate-pulse" style={{ width: 200, height: 22, marginBottom: 20 }} />
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx}>
                        <div className="skeleton animate-pulse" style={{ width: idx % 2 === 0 ? 150 : 90, height: 12, marginBottom: 8 }} />
                        <div className="skeleton animate-pulse" style={{ width: "100%", height: 38, borderRadius: 6 }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CV / Resume Card Skeleton */}
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 20 }}>
                  <div className="skeleton animate-pulse" style={{ width: 120, height: 22, marginBottom: 20 }} />
                  {/* Current resume box */}
                  <div style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <div className="skeleton animate-pulse" style={{ width: 110, height: 14, marginBottom: 12 }} />
                    <div className="skeleton animate-pulse" style={{ width: 180, height: 16, marginBottom: 12 }} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <div className="skeleton animate-pulse" style={{ width: 110, height: 28, borderRadius: 6 }} />
                      <div className="skeleton animate-pulse" style={{ width: 90, height: 28, borderRadius: 6 }} />
                    </div>
                  </div>
                  {/* Upload zone */}
                  <div style={{ border: "2px dashed #e5e7eb", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="skeleton animate-pulse" style={{ width: 28, height: 28, borderRadius: "50%", marginBottom: 12 }} />
                    <div className="skeleton animate-pulse" style={{ width: 120, height: 16, marginBottom: 6 }} />
                    <div className="skeleton animate-pulse" style={{ width: 180, height: 12 }} />
                  </div>
                </div>

                {/* Save Button Skeleton */}
                <div className="skeleton animate-pulse" style={{ width: 140, height: 42, borderRadius: 6 }} />
              </div>
            ) : activeTab === "notifications" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="skeleton animate-pulse" style={{ width: 180, height: 26, marginBottom: 8 }} />
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} style={{ background: "#fff", padding: "16px 20px", borderRadius: 10, border: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div className="skeleton animate-pulse" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton animate-pulse" style={{ width: "70%", height: 14, marginBottom: 8 }} />
                      <div className="skeleton animate-pulse" style={{ width: "45%", height: 12 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "interviews" ? (
              <div>
                <div className="skeleton animate-pulse" style={{ width: 200, height: 26, marginBottom: 8 }} />
                <div className="skeleton animate-pulse" style={{ width: 260, height: 14, marginBottom: 24 }} />
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="skeleton animate-pulse" style={{ width: 160, height: 16, marginBottom: 8 }} />
                      <div className="skeleton animate-pulse" style={{ width: 120, height: 13, marginBottom: 6 }} />
                      <div className="skeleton animate-pulse" style={{ width: 100, height: 13 }} />
                    </div>
                    <div className="skeleton animate-pulse" style={{ width: 80, height: 28, borderRadius: 8 }} />
                  </div>
                ))}
              </div>
            ) : activeTab === "onboarding" ? (
              <div>
                <div className="skeleton animate-pulse" style={{ width: 170, height: 26, marginBottom: 8 }} />
                <div className="skeleton animate-pulse" style={{ width: 300, height: 14, marginBottom: 24 }} />
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 16 }}>
                  <div className="skeleton animate-pulse" style={{ width: 130, height: 18, marginBottom: 16 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} style={{ background: "#f9fafb", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <div className="skeleton animate-pulse" style={{ width: "80%", height: 13, marginBottom: 8 }} />
                        <div className="skeleton animate-pulse" style={{ width: "100%", height: 36, borderRadius: 6 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <div className="skeleton animate-pulse" style={{ width: 180, height: 24, marginBottom: 16 }} />
                <div className="skeleton animate-pulse" style={{ width: "90%", height: 16, marginBottom: 12 }} />
                <div className="skeleton animate-pulse" style={{ width: "80%", height: 16, marginBottom: 12 }} />
                <div className="skeleton animate-pulse" style={{ width: "50%", height: 16 }} />
              </div>
            )
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <OverviewSection
                  profile={profile}
                  dynamicApplications={dynamicApplications}
                  interviewsCount={interviews.length}
                  setActiveTab={setActiveTab}
                />
              )}

              {/* Applications Tab */}
              {activeTab === "applications" && (
                <ApplicationsSection
                  dynamicApplications={dynamicApplications}
                  allJobs={liveJobs}
                  setSelectedJobDesc={setSelectedJobDesc}
                />
              )}

              {/* Profile & Resume Tab */}
              {activeTab === "resume" && (
                <ProfileSection
                  profile={profile}
                  setProfile={setProfile}
                  resumeFile={resumeFile}
                  resumeUrl={resumeUrl}
                  fileSizeError={fileSizeError}
                  handleResumeUpload={handleResumeUpload}
                  handleViewResume={handleViewResume}
                  handleSave={handleSave}
                  saved={saved}
                  saving={saving}
                  personalSectionRef={personalSectionRef}
                  professionalSectionRef={professionalSectionRef}
                  resumeSectionRef={resumeSectionRef}
                />
              )}

              {/* Change Password / Security Tab */}
              {activeTab === "security" && (
                <SecuritySection />
              )}


              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <NotificationsSection notifications={dashboardNotifications} />
              )}

              {/* Upcoming Interviews Tab */}
              {activeTab === "interviews" && <InterviewsSection />}

              {/* Onboarding Tab */}
              {activeTab === "onboarding" && (
                <OnboardingSection
                  offer={offer}
                  offerLoading={offerLoading}
                  offerActionLoading={offerActionLoading}
                  onAcceptOffer={handleAcceptOffer}
                  onDeclineOffer={handleDeclineOffer}
                  offerAccepted={offerAccepted}
                  offerRejected={offerRejected}
                  showOfferConfirm={showOfferConfirm}
                  setShowOfferConfirm={setShowOfferConfirm}
                  onboardingRecord={onboardingRecord}
                  docs={docs}
                  setDocs={setDocs}
                  docUrls={docUrls}
                  setDocUrls={setDocUrls}
                  setDocFiles={setDocFiles}
                  aadharNumber={aadharNumber}
                  setAadharNumber={setAadharNumber}
                  panNumber={panNumber}
                  setPanNumber={setPanNumber}
                  pfNumber={pfNumber}
                  setPfNumber={setPfNumber}
                  esiNumber={esiNumber}
                  setEsiNumber={setEsiNumber}
                  bankAccount={bankAccount}
                  setBankAccount={setBankAccount}
                  bankIfsc={bankIfsc}
                  setBankIfsc={setBankIfsc}
                  bankName={bankName}
                  setBankName={setBankName}
                  bankHolder={bankHolder}
                  setBankHolder={setBankHolder}
                  docsSubmitted={docsSubmitted}
                  docsSubmitting={docsSubmitting}
                  startDocCamera={startDocCamera}
                  handleSubmitDocs={handleSubmitDocs}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Profile Picture Popup Dialog */}
      <ProfilePicturePopup
        open={showPhotoPopup}
        picRef={picRef}
        onTakePhoto={() => {
          setCameraTargetDocKey(null);
          setCameraOpen(true);
          setShowPhotoPopup(false);
        }}
        onPhotoUpload={handlePhotoUpload}
        onClose={() => setShowPhotoPopup(false)}
      />

      {/* Job Description Drawer Overlay */}
      <JobDescriptionDrawer
        selectedJobDesc={selectedJobDesc}
        jobApplications={jobApplications}
        onClose={() => setSelectedJobDesc(null)}
      />

      {/* Unsaved Changes Tab Navigation Confirm Overlay */}
      <UnsavedChangesModal
        open={!!pendingNavigation}
        onDismiss={() => {
          // The physical back button already left "resume" by the time we
          // could ask — staying means sending the URL back there ourselves.
          if (pendingNavigation?.type === "restoreResumeTab") {
            navigate(routes.dashboardTab("resume"));
          }
          setPendingNavigation(null);
        }}
        onDiscard={() => {
          const action = pendingNavigation;
          setPendingNavigation(null);
          revertUnsavedChanges();
          proceedNavigation(action);
        }}
        onSave={async () => {
          const savedSuccessfully = await handleSave();
          if (savedSuccessfully) {
            const action = pendingNavigation;
            setPendingNavigation(null);
            proceedNavigation(action);
          }
        }}
      />

      {/* Universal Camera Modal Streamer */}
      <CameraModal
        isOpen={cameraOpen}
        cameraTargetDocKey={cameraTargetDocKey}
        onCapture={handlePhotoCapture}
        onClose={() => setCameraOpen(false)}
      />
    </motion.div>
  );
}