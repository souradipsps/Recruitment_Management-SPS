import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Bell, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import logoImg from "../../assets/logo.png";

// Mock data & configurations
import { MAROON, GOLD, notifications } from "./data/dashboardMockData";

// Layout
import { DashboardSidebar } from "./components/layout/DashboardSidebar";

// Tab sections
import { OverviewSection } from "./components/sections/OverviewSection";
import { ApplicationsSection } from "./components/sections/ApplicationsSection";
import { ProfileSection } from "./components/sections/ProfileSection";
import { InterviewsSection } from "./components/sections/InterviewsSection";
import { OnboardingSection } from "./components/sections/OnboardingSection";
import { NotificationsSection } from "./components/sections/NotificationsSection";

// Popups & overlays
import { CameraModal } from "./components/popup/CameraModal";
import { ProfilePicturePopup } from "./components/popup/ProfilePicturePopup";
import { JobDescriptionDrawer } from "./components/popup/JobDescriptionDrawer";
import { UnsavedChangesModal } from "./components/popup/UnsavedChangesModal";

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
  cameFromApply = false,
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
  const selectedJobDescRef = useRef(selectedJobDesc);
  const sidebarOpenRef = useRef(sidebarOpen);
  const unsavedChangesRef = useRef(false);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedJobDescRef.current = selectedJobDesc; }, [selectedJobDesc]);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  const unsaved = hasUnsavedChanges();
  useEffect(() => {
    unsavedChangesRef.current = unsaved;
  }, [unsaved]);

  // Handle browser back button navigation interception
  useEffect(() => {
    window.history.pushState({ portal: "candidate-dashboard" }, "");

    const handlePopState = () => {
      const currentTab = activeTabRef.current;
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

      if (cameFromApply) {
        if (currentTab !== "resume") {
          window.history.pushState({ portal: "candidate-dashboard" }, "");
          setActiveTab("resume");
        } else {
          if (unsavedChangesRef.current) {
            window.history.pushState({ portal: "candidate-dashboard" }, "");
            setPendingNavigation({ type: "close", bypassApplyModal: false });
          } else {
            onClose(false);
          }
        }
      } else {
        if (currentTab !== "dashboard") {
          window.history.pushState({ portal: "candidate-dashboard" }, "");
          if (currentTab === "resume" && unsavedChangesRef.current) {
            setPendingNavigation({ type: "tab", targetId: "dashboard" });
          } else {
            setActiveTab("dashboard");
          }
        } else {
          onClose(true);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.portal === "candidate-dashboard") {
        window.history.back();
      }
    };
  }, [onClose, cameFromApply]);

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
    setLastSavedProfile({
      ...profile,
      resumeFile: resumeFile,
    });
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
          <div style={{ position: "relative" }}>
            <Bell
              size={18}
              color="rgba(255,255,255,0.8)"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (activeTab === "resume" && hasUnsavedChanges()) {
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
            <NotificationsSection notifications={notifications} />
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
        appliedJobIds={appliedJobIds}
        applicationsData={applicationsData}
        onClose={() => setSelectedJobDesc(null)}
      />

      {/* Unsaved Changes Tab Navigation Confirm Overlay */}
      <UnsavedChangesModal
        open={!!pendingNavigation}
        onDismiss={() => setPendingNavigation(null)}
        onDiscard={() => {
          const action = pendingNavigation;
          setPendingNavigation(null);
          revertUnsavedChanges();
          proceedNavigation(action);
        }}
        onSave={() => {
          const savedSuccessfully = handleSave();
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