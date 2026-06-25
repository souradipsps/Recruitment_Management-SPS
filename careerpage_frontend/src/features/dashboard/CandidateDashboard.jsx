import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Menu,
  Bell,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import logoImg from "../../assets/logo.png";

// Mock data & configurations
import {
  MAROON,
  GOLD,
  statusConfig,
  capitalizeWords,
  offerLetter,
  notifications,
} from "./data/dashboardMockData";

// Modular Sub-components
import { CameraModal } from "./components/CameraModal";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { OverviewSection } from "./components/OverviewSection";
import { ApplicationsSection } from "./components/ApplicationsSection";
import { ProfileSection } from "./components/ProfileSection";
import { InterviewsSection } from "./components/InterviewsSection";
import { OnboardingSection } from "./components/OnboardingSection";

export function CandidateDashboard({
  onClose,
  userName = "Candidate",
  signupData,
  appliedJobIds = [],
  allJobs = [],
  onLogout,
  initialProfileData,
  initialTab = "dashboard",
  initialSection,
  onProfileUpdate,
  applicationsData = {},
}) {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJobDesc, setSelectedJobDesc] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);

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

  const [profilePic, setProfilePic] = useState(null);
  const [saved, setSaved] = useState(false);

  // Resume states
  const [resumeFile, setResumeFile] = useState(initialProfileData?.resumeFile || null);
  const [resumeUrl, setResumeUrl] = useState(initialProfileData?.resumeUrl || null);
  const [resumeReplaced, setResumeReplaced] = useState(false);
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
  const [docs, setDocs] = useState({});
  const [docUrls, setDocUrls] = useState({});
  const [docsSubmitted, setDocsSubmitted] = useState(false);

  // Settings states (Mock notifications)
  const [settingsNotify, setSettingsNotify] = useState({
    email: true,
    sms: true,
    visibility: true,
  });

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTargetDocKey, setCameraTargetDocKey] = useState(null);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);

  // Dynamic applications based on allJobs and appliedJobIds
  const dynamicApplications = allJobs
    .filter((j) => appliedJobIds.includes(j.id))
    .map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      location: j.location,
      appliedDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: "Under Review",
      type: j.type,
    }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handles auto scrolling to specific sections in Profile
  useEffect(() => {
    if (initialTab === "resume") {
      setTimeout(() => {
        if (initialSection === "personal") {
          personalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (initialSection === "professional") {
          professionalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          resumeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [initialTab, initialSection]);

  // Keep refs in sync for popstate navigation logic
  const activeTabRef = useRef(activeTab);
  const resumeReplacedRef = useRef(resumeReplaced);
  const selectedJobDescRef = useRef(selectedJobDesc);
  const sidebarOpenRef = useRef(sidebarOpen);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { resumeReplacedRef.current = resumeReplaced; }, [resumeReplaced]);
  useEffect(() => { selectedJobDescRef.current = selectedJobDesc; }, [selectedJobDesc]);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  // Handle browser back button navigation interception
  useEffect(() => {
    window.history.pushState({ portal: "candidate-dashboard" }, "");

    const handlePopState = () => {
      const currentTab = activeTabRef.current;
      const currentResumeReplaced = resumeReplacedRef.current;
      const currentJobDesc = selectedJobDescRef.current;
      const currentSidebarOpen = sidebarOpenRef.current;

      if (currentJobDesc) {
        window.history.pushState({ portal: "candidate-dashboard" }, "");
        setSelectedJobDesc(null);
        return;
      }

      if (currentSidebarOpen) {
        window.history.pushState({ portal: "candidate-dashboard" }, "");
        setSidebarOpen(false);
        return;
      }

      if (currentTab !== "dashboard") {
        window.history.pushState({ portal: "candidate-dashboard" }, "");
        if (currentTab === "resume" && currentResumeReplaced) {
          setPendingNavigation({ type: "tab", targetId: "dashboard" });
        } else {
          setActiveTab("dashboard");
        }
      } else {
        onClose(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.portal === "candidate-dashboard") {
        window.history.back();
      }
    };
  }, [onClose]);

  // Reset resume state changes on cancellation
  const revertUnsavedChanges = () => {
    setResumeFile(initialProfileData?.resumeFile || null);
    setResumeUrl(initialProfileData?.resumeUrl || null);
    setResumeReplaced(false);
  };

  // Profile picture camera/file triggers
  const handlePhotoUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setProfilePic(URL.createObjectURL(f));
      setShowPhotoPopup(false);
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
    setResumeReplaced(true);
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
                  <div class="meta-value">${
                    profile.professionalQualification === "Other"
                      ? profile.professionalQualificationOther || "Other Qualification"
                      : profile.professionalQualification || "None"
                  }</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Years of Experience</div>
                  <div class="meta-value">${profile.experience || "None"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Expected Salary</div>
                  <div class="meta-value">${profile.salary || "Not specified"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Extracurricular Activities</div>
                  <div class="meta-value">${
                    profile.extracurricular === "Other"
                      ? profile.extracurricularOther || "Other Activities"
                      : profile.extracurricular || "None"
                  }</div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Interested Roles</div>
              <div>
                ${
                  profile.roles && profile.roles.length > 0
                    ? profile.roles.map((role) => `<span class="tag">${role}</span>`).join("")
                    : '<span style="color: #9ca3af; font-style: italic; font-size: 14px;">No roles selected</span>'
                }
              </div>
            </div>
            <div class="section">
              <div class="section-title">Skills</div>
              <div>
                ${
                  profile.skills && profile.skills.length > 0
                    ? profile.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")
                    : '<span style="color: #9ca3af; font-style: italic; font-size: 14px;">No skills listed</span>'
                }
              </div>
            </div>
            ${
              profile.linkedin || profile.portfolio
                ? `
            <div class="section">
              <div class="section-title">Professional Links</div>
              <div class="grid-2">
                ${
                  profile.linkedin
                    ? `
                <div class="meta-item">
                  <div class="meta-label">LinkedIn Profile</div>
                  <div class="meta-value"><a href="${
                    profile.linkedin.startsWith("http") ? profile.linkedin : "https://" + profile.linkedin
                  }" target="_blank" style="color: #72102a; text-decoration: none; font-weight: 600;">${profile.linkedin} ↗</a></div>
                </div>`
                    : ""
                }
                ${
                  profile.portfolio
                    ? `
                <div class="meta-item">
                  <div class="meta-label">Portfolio URL</div>
                  <div class="meta-value"><a href="${
                    profile.portfolio.startsWith("http") ? profile.portfolio : "https://" + profile.portfolio
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
  const handleSave = () => {
    if (!profile.phone || profile.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
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
    };
    onProfileUpdate?.(updatedData);
    setResumeReplaced(false);
    setTimeout(() => setSaved(false), 2000);
    return true;
  };

  // Onboarding documents submission validation
  const handleSubmitDocs = () => {
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
    setDocsSubmitted(true);
    toast.success("Documents submitted successfully!");
  };

  // Doc camera helper
  const startDocCamera = (docKey) => {
    setCameraTargetDocKey(docKey);
    setCameraOpen(true);
  };

  // Photo captured callback from CameraModal
  const handlePhotoCapture = (dataUrl, targetKey) => {
    if (targetKey) {
      setDocs((prev) => ({ ...prev, [targetKey]: `Captured_${targetKey}.jpg` }));
      setDocUrls((prev) => ({ ...prev, [targetKey]: dataUrl }));
    } else {
      setProfilePic(dataUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          height: "56px",
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
              if (activeTab === "resume" && resumeReplaced) {
                setPendingNavigation({ type: "close", bypassApplyModal: true });
              } else {
                onClose(true);
              }
            }}
          >
            <img
              src={logoImg}
              alt="South Point School"
              style={{ height: "32px", objectFit: "contain" }}
            />
            <div>
              <div
                style={{
                  color: GOLD,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.1,
                }}
              >
                South Point School
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                }}
              >
                CANDIDATE PORTAL
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ position: "relative" }}>
            <Bell
              size={18}
              color="rgba(255,255,255,0.8)"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (activeTab === "resume" && resumeReplaced) {
                  setPendingNavigation({ type: "tab", targetId: "notifications" });
                } else {
                  setActiveTab("notifications");
                }
              }}
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
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.78rem",
            }}
            className="hidden sm:block"
          >
            {profile.name}
          </div>
          <button
            onClick={() => {
              if (activeTab === "resume" && resumeReplaced) {
                setPendingNavigation({ type: "tab", targetId: "dashboard" });
              } else if (activeTab !== "dashboard") {
                setActiveTab("dashboard");
              } else {
                onClose(true);
              }
            }}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "6px",
              padding: "5px 12px",
              cursor: "pointer",
              display: "flex",
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
                top: "56px",
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
          resumeReplaced={resumeReplaced}
          unreadCount={unreadCount}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveTab={setActiveTab}
          setPendingNavigation={setPendingNavigation}
          setShowPhotoPopup={setShowPhotoPopup}
          onLogout={onLogout}
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
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <OverviewSection
              profile={profile}
              dynamicApplications={dynamicApplications}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <ApplicationsSection
              dynamicApplications={dynamicApplications}
              allJobs={allJobs}
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
              personalSectionRef={personalSectionRef}
              professionalSectionRef={professionalSectionRef}
              resumeSectionRef={resumeSectionRef}
            />
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                }}
              >
                Notifications
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: n.read ? "#fff" : "#fef9f0",
                      border: `1px solid ${n.read ? "#e5e7eb" : "#fde68a"}`,
                      borderRadius: "10px",
                      padding: "14px 18px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: n.read ? "#d1d5db" : GOLD,
                        flexShrink: 0,
                        marginTop: "5px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", color: "#1a0a0a", lineHeight: 1.5 }}>
                        {n.text}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#9a8a8a", marginTop: "4px" }}>
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upcoming Interviews Tab */}
          {activeTab === "interviews" && <InterviewsSection />}

          {/* Onboarding Tab */}
          {activeTab === "onboarding" && (
            <OnboardingSection
              offerAccepted={offerAccepted}
              setOfferAccepted={setOfferAccepted}
              offerRejected={offerRejected}
              setOfferRejected={setOfferRejected}
              showOfferConfirm={showOfferConfirm}
              setShowOfferConfirm={setShowOfferConfirm}
              docs={docs}
              setDocs={setDocs}
              docUrls={docUrls}
              setDocUrls={setDocUrls}
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
              startDocCamera={startDocCamera}
              handleSubmitDocs={handleSubmitDocs}
            />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                }}
              >
                Settings
              </h1>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    key: "email",
                    label: "Email Notifications",
                    desc: "Receive updates about your applications via email",
                  },
                  {
                    key: "sms",
                    label: "SMS Alerts",
                    desc: "Get text message alerts for interview invitations",
                  },
                  {
                    key: "visibility",
                    label: "Profile Visibility",
                    desc: "Allow recruiters to find your profile",
                  },
                ].map(({ key, label, desc }, i) => (
                  <div
                    key={label}
                    style={{
                      padding: "16px 20px",
                      borderBottom: i < 2 ? "1px solid #f0f0f0" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1a0a0a" }}>
                        {label}
                      </div>
                      <div style={{ color: "#6b5c5c", fontSize: "0.75rem", marginTop: "2px" }}>
                        {desc}
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        setSettingsNotify((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                      style={{
                        width: "40px",
                        height: "22px",
                        borderRadius: "999px",
                        background: settingsNotify[key] ? MAROON : "#d1d5db",
                        cursor: "pointer",
                        position: "relative",
                        flexShrink: 0,
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: settingsNotify[key] ? "21px" : "3px",
                          top: "3px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px 20px",
                }}
              >
                <button
                  onClick={onLogout}
                  style={{
                    color: "#991b1b",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    background: "none",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    padding: "9px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Profile Picture Popup Dialog */}
      <AnimatePresence>
        {showPhotoPopup && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              background: "rgba(0, 0, 0, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setShowPhotoPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                width: "100%",
                maxWidth: "320px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: MAROON,
                  marginBottom: "16px",
                }}
              >
                Update Profile Picture
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => {
                    setCameraTargetDocKey(null);
                    setCameraOpen(true);
                    setShowPhotoPopup(false);
                  }}
                  style={{
                    background: MAROON,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Take Photo (Webcam)
                </button>
                <label
                  style={{
                    background: "#faf8f5",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "12px",
                    color: "#4a4a4a",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  Upload File
                  <input
                    ref={picRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />
                </label>
                <button
                  onClick={() => setShowPhotoPopup(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b5c5c",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginTop: "6px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Description Drawer Overlay */}
      <AnimatePresence>
        {selectedJobDesc && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
            }}
            onClick={() => setSelectedJobDesc(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                background: "#fff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "500px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                padding: "28px",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedJobDesc(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>

              {/* Title & Department */}
              <h2
                style={{
                  color: MAROON,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: "6px",
                  paddingRight: "24px",
                }}
              >
                {selectedJobDesc.title}
              </h2>
              <div
                style={{
                  color: "#6b5c5c",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  marginBottom: "20px",
                }}
              >
                {selectedJobDesc.department} &bull; {selectedJobDesc.location}
              </div>

              {/* Job Info Pills */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(114,16,42,0.08)",
                    color: MAROON,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {selectedJobDesc.type}
                </span>
                <span
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    color: "#9a781b",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "999px",
                  }}
                >
                  Deadline: {selectedJobDesc.deadline}
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a0a0a", marginBottom: "6px" }}>
                  Job Description
                </h4>
                <p style={{ fontSize: "0.82rem", color: "#4a4a4a", lineHeight: 1.6 }}>
                  {selectedJobDesc.description}
                </p>
              </div>

              {/* Qualifications */}
              {selectedJobDesc.qualifications && selectedJobDesc.qualifications.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a0a0a", marginBottom: "8px" }}>
                    Required Qualifications
                  </h4>
                  <ul style={{ paddingLeft: "16px", margin: 0 }}>
                    {selectedJobDesc.qualifications.map((qual, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: "0.82rem",
                          color: "#4a4a4a",
                          lineHeight: 1.6,
                          marginBottom: "4px",
                          listStyleType: "disc",
                        }}
                      >
                        {qual}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Information Submitted */}
              {appliedJobIds.includes(selectedJobDesc.id) && (
                <div style={{ marginTop: "20px", borderTop: "1.5px solid #e5e7eb", paddingTop: "20px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "12px" }}>
                    Your Additional Information
                  </h4>
                  {(() => {
                    const appData = applicationsData[selectedJobDesc.id] || {
                      coverLetter: "Interested in the position.",
                      noticePeriod: "Immediate",
                      hasReferral: "No",
                      referralEmpId: "",
                    };
                    return (
                      <div
                        style={{
                          background: "#faf8f5",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }}>
                            Notice Period
                          </span>
                          <div style={{ fontSize: "0.82rem", color: "#1a0a0a", fontWeight: 500, marginTop: "2px" }}>
                            {appData.noticePeriod}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }}>
                            Referral Information
                          </span>
                          <div style={{ fontSize: "0.82rem", color: "#1a0a0a", fontWeight: 500, marginTop: "2px" }}>
                            {appData.hasReferral === "Yes" ? `Yes (Employee ID: ${appData.referralEmpId})` : "No Referral"}
                          </div>
                        </div>
                        {appData.coverLetter && (
                          <div>
                            <span style={{ fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }}>
                              Cover Letter / SOP
                            </span>
                            <div style={{ fontSize: "0.82rem", color: "#4a4a4a", marginTop: "2px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                              {appData.coverLetter}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedJobDesc(null)}
                  style={{
                    background: MAROON,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Tab Navigation Confirm Overlay */}
      <AnimatePresence>
        {pendingNavigation && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setPendingNavigation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px 24px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(114,16,42,0.08)",
                  borderRadius: "50%",
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <AlertCircle size={28} color={MAROON} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: MAROON,
                  marginBottom: "8px",
                }}
              >
                Unsaved Changes
              </h3>
              <p
                style={{
                  color: "#6b5c5c",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  marginBottom: "24px",
                }}
              >
                Are you sure you do not want to save the changes? If you proceed, your new resume upload will be lost.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    const action = pendingNavigation;
                    setPendingNavigation(null);
                    revertUnsavedChanges();
                    if (action.type === "tab" && action.targetId) {
                      setActiveTab(action.targetId);
                      setSidebarOpen(false);
                    } else if (action.type === "close") {
                      onClose(action.bypassApplyModal);
                    } else if (action.type === "logout") {
                      onLogout?.();
                    }
                  }}
                  style={{
                    flex: 1,
                    background: MAROON,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  className="hover:opacity-90"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => {
                    const savedSuccessfully = handleSave();
                    if (savedSuccessfully) {
                      const action = pendingNavigation;
                      setPendingNavigation(null);
                      if (action.type === "tab" && action.targetId) {
                        setActiveTab(action.targetId);
                        setSidebarOpen(false);
                      } else if (action.type === "close") {
                        onClose(action.bypassApplyModal);
                      } else if (action.type === "logout") {
                        onLogout?.();
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    background: "#faf8f5",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#4a4a4a",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  className="hover:bg-gray-50"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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