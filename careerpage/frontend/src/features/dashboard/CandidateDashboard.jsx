const _jsxFileName = "temp_dashboard\\CandidateDashboard.tsx"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  LayoutDashboard,
  FileText,
  Upload,
  User,

  Bell,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  Download,
  Eye,
  Menu,
  Video,
  Link,
  PartyPopper,
  ClipboardCheck,
  Camera,
  Trash2,
} from "lucide-react";
import logoImg from "../../assets/logo.png";

import { toast } from "sonner";

const MAROON = "#72102a";

const ALL_SKILLS = [
  "Curriculum Development", "Classroom Management", "Student Assessment",
  "Communication", "Leadership", "Team Collaboration", "Microsoft Office",
  "Data Analysis", "Project Management", "Problem Solving",
  "CBSE Curriculum", "Digital Literacy", "Research & Development",
  "Counselling", "Event Management", "Administration", "IT Support",
  "Sports Coaching", "Content Creation", "Public Speaking",
];

function SkillsMultiSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) { onChange([...selected, trimmed]); }
    setCustom("");
  };
  return (
    React.createElement('div', { style: { position: "relative" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 56 } }
      , React.createElement('div', { onClick: () => setOpen(!open), style: { minHeight: "42px", padding: "8px 32px 8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#faf8f5", cursor: "pointer", display: "flex", flexWrap: "wrap", gap: "4px", position: "relative" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 57 } }
        , selected.length === 0 && React.createElement('span', { style: { color: "#9ca3af", fontSize: "0.85rem", alignSelf: "center" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 58 } }, "Select or add skills…")
        , selected.map((s) => (
          React.createElement('span', { key: s, onClick: (e) => { e.stopPropagation(); toggle(s); }, style: { background: `rgba(114,16,42,0.1)`, color: MAROON, fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 60 } }
            , s, " ×"
          )
        ))
        , React.createElement('span', { style: { position: "absolute", right: "10px", top: "50%", transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: "transform 0.2s", color: "#6b5c5c", fontSize: "0.75rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 64 } }, "▼")
      )
      , open && (
        React.createElement('div', { style: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "8px", zIndex: 100, maxHeight: "220px", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 67 } }
          , React.createElement('div', { style: { padding: "8px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 68 } }
            , React.createElement('input', { value: custom, onChange: (e) => setCustom(e.target.value), onKeyDown: (e) => e.key === "Enter" && addCustom(), placeholder: "Add custom skill…", style: { flex: 1, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "0.8rem", outline: "none" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 69 } })
            , React.createElement('button', { onClick: addCustom, style: { background: MAROON, color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 70 } }, "Add")
          )
          , ALL_SKILLS.map((opt) => (
            React.createElement('div', { key: opt, onClick: () => toggle(opt), style: { padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: selected.includes(opt) ? MAROON : "#1a0a0a", background: selected.includes(opt) ? "rgba(114,16,42,0.05)" : "transparent", fontWeight: selected.includes(opt) ? 600 : 400 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 73 } }
              , opt
              , selected.includes(opt) && React.createElement('span', { style: { color: MAROON }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 75 } }, "✓")
            )
          ))
        )
      )
    )
  );
}
const GOLD = "#c9a84c";
const CREAM = "#faf8f5";

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};
































const appliedJobs = [
  {
    id: 1,
    title: "Senior Mathematics Teacher",
    department: "Academic Department",
    location: "Guwahati, Assam",
    appliedDate: "June 10, 2026",
    status: "Under Review",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Physics Teacher",
    department: "Academic Department",
    location: "Guwahati, Assam",
    appliedDate: "June 8, 2026",
    status: "Shortlisted",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Academic Coordinator",
    department: "Administration",
    location: "Guwahati, Assam",
    appliedDate: "June 5, 2026",
    status: "Rejected",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Computer Science Teacher",
    department: "Academic Department",
    location: "Guwahati, Assam",
    appliedDate: "June 1, 2026",
    status: "Interview Scheduled",
    type: "Full-time",
  },
];

const notifications = [
  {
    id: 1,
    text: "Your application for Physics Teacher has been shortlisted.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    text: "Interview scheduled for Computer Science Teacher on June 20.",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    text: "Your application for Academic Coordinator was not successful.",
    time: "3 days ago",
    read: true,
  },
];

const statusConfig


  = {
  "Under Review": {
    color: "#b45309",
    bg: "#fef3c7",
    icon: React.createElement(Clock, { size: 13, __self: this, __source: { fileName: _jsxFileName, lineNumber: 188 } }),
  },
  Shortlisted: {
    color: "#065f46",
    bg: "#d1fae5",
    icon: React.createElement(CheckCircle, { size: 13, __self: this, __source: { fileName: _jsxFileName, lineNumber: 193 } }),
  },
  Rejected: {
    color: "#991b1b",
    bg: "#fee2e2",
    icon: React.createElement(XCircle, { size: 13, __self: this, __source: { fileName: _jsxFileName, lineNumber: 198 } }),
  },
  "Interview Scheduled": {
    color: "#1e40af",
    bg: "#dbeafe",
    icon: React.createElement(AlertCircle, { size: 13, __self: this, __source: { fileName: _jsxFileName, lineNumber: 203 } }),
  },
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "resume", label: "My Profile & Resume", icon: Upload },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "interviews", label: "Upcoming Interviews", icon: Video },
  { id: "onboarding", label: "Onboarding", icon: ClipboardCheck },
];

const interviews = [
  {
    id: 1,
    role: "Computer Science Teacher",
    date: "June 20, 2026",
    time: "11:00 AM",
    mode: "Online",
    platform: "Google Meet",
    link: "https://meet.google.com/abc-defg-hij",
    interviewer: "Mr. Rajesh Kumar, HOD Technology",
    status: "Upcoming",
  },
  {
    id: 2,
    role: "Physics Teacher",
    date: "June 25, 2026",
    time: "2:30 PM",
    mode: "In-Person",
    platform: null,
    link: null,
    interviewer: "Dr. Anita Sharma, Academic Head",
    status: "Upcoming",
  },
];

const offerLetter = {
  role: "Computer Science Teacher",
  issuedDate: "June 28, 2026",
  expiryDate: "July 10, 2026",
  joiningDate: "July 15, 2026",
  department: "Academic Department",
  salary: "₹5.2 LPA",
};

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
  const dynamicApplications = allJobs
    .filter((j) => appliedJobIds.includes(j.id))
    .map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      location: j.location,
      appliedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      status: "Under Review",
      type: j.type,
    }));
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedJobDesc, setSelectedJobDesc] = useState(null);
  const [resumeFile, setResumeFile] = useState(
    _optionalChain([initialProfileData, 'optionalAccess', _ => _.resumeFile]) || null,
  );
  const [resumeUrl, setResumeUrl] = useState(
    _optionalChain([initialProfileData, 'optionalAccess', _2 => _2.resumeUrl]) || null,
  );
  const [updateResume, setUpdateResume] = useState(false);
  const [fileSizeError, setFileSizeError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: _optionalChain([initialProfileData, 'optionalAccess', _3 => _3.fullName])
      ? initialProfileData.fullName.trim().split(" ")[0]
      : (_optionalChain([signupData, 'optionalAccess', _4 => _4.name]) || userName),
    lastName: _optionalChain([initialProfileData, 'optionalAccess', _5 => _5.fullName])
      ? initialProfileData.fullName.trim().split(" ").slice(1).join(" ")
      : (_optionalChain([signupData, 'optionalAccess', _6 => _6.lastName]) || ""),
    email: _optionalChain([signupData, 'optionalAccess', _7 => _7.email]) || "",
    phone: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _8 => _8.phone]), () => ((_optionalChain([signupData, 'optionalAccess', _9 => _9.phone]) || ""))),
    location: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _10 => _10.location]), () => ("Guwahati, Assam")),
    highestEducation: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _11 => _11.education]), () => ("")),
    degreeName: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _12 => _12.degreeName]), () => ("")),
    professionalQualification: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _13 => _13.professionalQualification]), () => ("")),
    professionalQualificationOther: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _14 => _14.professionalQualificationOther]), () => ("")),
    experience: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _15 => _15.experience]), () => ("")),
    salary: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _16 => _16.salary]), () => ("")),
    extracurricular: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _17 => _17.extracurricular]), () => ("")),
    extracurricularOther: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _18 => _18.extracurricularOther]), () => ("")),
    roles: (_nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _19 => _19.selectedRoles]), () => ([]))),
    skills: (_nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _20 => _20.selectedSkills]), () => ([]))),
    linkedin: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _21 => _21.linkedin]), () => ("")),
    portfolio: _nullishCoalesce(_optionalChain([initialProfileData, 'optionalAccess', _22 => _22.portfolio]), () => ("")),
  });
  const [saved, setSaved] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [resumeReplaced, setResumeReplaced] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState


    (null);
  const personalSectionRef = useRef(null);
  const professionalSectionRef = useRef(null);
  const resumeSectionRef = useRef(null);

  useEffect(() => {
    if (initialTab === "resume") {
      setTimeout(() => {
        if (initialSection === "personal") {
          _optionalChain([personalSectionRef, 'access', _23 => _23.current, 'optionalAccess', _24 => _24.scrollIntoView, 'call', _25 => _25({ behavior: "smooth", block: "start" })]);
        } else if (initialSection === "professional") {
          _optionalChain([professionalSectionRef, 'access', _26 => _26.current, 'optionalAccess', _27 => _27.scrollIntoView, 'call', _28 => _28({ behavior: "smooth", block: "start" })]);
        } else {
          _optionalChain([resumeSectionRef, 'access', _29 => _29.current, 'optionalAccess', _30 => _30.scrollIntoView, 'call', _31 => _31({ behavior: "smooth", block: "start" })]);
        }
      }, 300);
    }
  }, [initialTab, initialSection]);

  const activeTabRef = useRef(activeTab);
  const resumeReplacedRef = useRef(resumeReplaced);
  const selectedJobDescRef = useRef(selectedJobDesc);
  const sidebarOpenRef = useRef(sidebarOpen);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    resumeReplacedRef.current = resumeReplaced;
  }, [resumeReplaced]);

  useEffect(() => {
    selectedJobDescRef.current = selectedJobDesc;
  }, [selectedJobDesc]);

  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  useEffect(() => {
    window.history.pushState({ portal: "candidate-dashboard" }, "");

    const handlePopState = (event) => {
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
      if (window.history.state && window.history.state.portal === "candidate-dashboard") {
        window.history.back();
      }
    };
  }, [onClose]);

  const revertUnsavedChanges = () => {
    setResumeFile(_optionalChain([initialProfileData, 'optionalAccess', _32 => _32.resumeFile]) || null);
    setResumeUrl(_optionalChain([initialProfileData, 'optionalAccess', _33 => _33.resumeUrl]) || null);
    setResumeReplaced(false);
  };

  const picRef = useRef(null);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTargetDocKey, setCameraTargetDocKey] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error("Could not access camera. Please check permissions or device connection.");
    }
  };

  const startDocCamera = async (docKey) => {
    setCameraTargetDocKey(docKey);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error("Could not access camera. Please check permissions or device connection.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraTargetDocKey(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = cameraTargetDocKey ? 640 : 300;
      canvas.height = cameraTargetDocKey ? 480 : 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");

        if (cameraTargetDocKey) {
          setDocs((prev) => ({
            ...prev,
            [cameraTargetDocKey]: `Captured_${cameraTargetDocKey}.jpg`
          }));
          setDocUrls((prev) => ({
            ...prev,
            [cameraTargetDocKey]: dataUrl
          }));
        } else {
          setProfilePic(dataUrl);
        }
      }
    }
    stopCamera();
    setShowPhotoPopup(false);
  };

  const closePhotoPopup = () => {
    stopCamera();
    setShowPhotoPopup(false);
  };

  const handlePhotoUpload = (e) => {
    const f = _optionalChain([e, 'access', _34 => _34.target, 'access', _35 => _35.files, 'optionalAccess', _36 => _36[0]]);
    if (f) {
      setProfilePic(URL.createObjectURL(f));
      setShowPhotoPopup(false);
    }
  };
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [offerRejected, setOfferRejected] = useState(false);
  const [showOfferConfirm, setShowOfferConfirm] = useState(null);
  const [docs, setDocs] = useState({});
  const [docUrls, setDocUrls] = useState({});
  const [docStatus] = useState({});
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [pfNumber, setPfNumber] = useState("");
  const [esiNumber, setEsiNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [docsSubmitted, setDocsSubmitted] = useState(false);
  const fileRef = useRef(null);

  const handleSubmitDocs = () => {
    const requiredKeys = ["aadhar", "pan", "bank_details", "photo"];
    const missing = requiredKeys.filter(k => !docs[k]);
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

  const unreadCount = notifications.filter(
    (n) => !n.read,
  ).length;

  const handleResumeUpload = (e) => {
    const f = _optionalChain([e, 'access', _37 => _37.target, 'access', _38 => _38.files, 'optionalAccess', _39 => _39[0]]);
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setFileSizeError("File exceeds 5 MB limit. Please upload a smaller file."); return; }
    setFileSizeError("");
    if (resumeUrl) URL.revokeObjectURL(resumeUrl);
    const url = URL.createObjectURL(f);
    setResumeFile(f.name);
    setResumeUrl(url);
    setUpdateResume(false);
    setResumeReplaced(true);
  };

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
              letter-spacing: -0.5px;
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
            .contact-info span {
              display: flex;
              align-items: center;
              gap: 5px;
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
        ? (profile.professionalQualificationOther || "Other Qualification")
        : (profile.professionalQualification || "None")
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
                  <div class="meta-value">${profile.extracurricular === "Other"
        ? (profile.extracurricularOther || "Other Activities")
        : (profile.extracurricular || "None")
      }</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Interested Roles</div>
              <div>
                ${profile.roles && profile.roles.length > 0
        ? profile.roles.map(role => `<span class="tag">${role}</span>`).join("")
        : '<span style="color: #9ca3af; font-style: italic; font-size: 14px;">No roles selected</span>'
      }
              </div>
            </div>

            <div class="section">
              <div class="section-title">Skills</div>
              <div>
                ${profile.skills && profile.skills.length > 0
        ? profile.skills.map(skill => `<span class="tag">${skill}</span>`).join("")
        : '<span style="color: #9ca3af; font-style: italic; font-size: 14px;">No skills listed</span>'
      }
              </div>
            </div>

            ${(profile.linkedin || profile.portfolio) ? `
            <div class="section">
              <div class="section-title">Professional Links</div>
              <div class="grid-2">
                ${profile.linkedin ? `
                <div class="meta-item">
                  <div class="meta-label">LinkedIn Profile</div>
                  <div class="meta-value"><a href="${profile.linkedin.startsWith('http') ? profile.linkedin : 'https://' + profile.linkedin}" target="_blank" style="color: #72102a; text-decoration: none; font-weight: 600;">${profile.linkedin} ↗</a></div>
                </div>` : ''}
                ${profile.portfolio ? `
                <div class="meta-item">
                  <div class="meta-label">Portfolio URL</div>
                  <div class="meta-value"><a href="${profile.portfolio.startsWith('http') ? profile.portfolio : 'https://' + profile.portfolio}" target="_blank" style="color: #72102a; text-decoration: none; font-weight: 600;">${profile.portfolio} ↗</a></div>
                </div>` : ''}
              </div>
            </div>` : ''}

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

  const [emailEdit, setEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const MOCK_OTP = "123456";

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
    _optionalChain([onProfileUpdate, 'optionalCall', _40 => _40(updatedData)]);
    setResumeReplaced(false);
    setTimeout(() => setSaved(false), 2000);
    return true;
  };

  return (
    React.createElement(motion.div, {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 768 }
    }

      /* Top Bar */
      , React.createElement('div', {
        style: {
          background: MAROON,
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 782 }
      }

        , React.createElement('div', { className: "flex items-center gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 793 } }
          , React.createElement('button', {
            onClick: () => setSidebarOpen(!sidebarOpen),
            className: "md:hidden",
            style: {
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              padding: "4px",
            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 794 }
          }

            , React.createElement(Menu, { size: 20, __self: this, __source: { fileName: _jsxFileName, lineNumber: 805 } })
          )
          , React.createElement('div', {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            },
            onClick: () => {
              if (activeTab === "resume" && resumeReplaced) {
                setPendingNavigation({ type: "close", bypassApplyModal: true });
              } else {
                onClose(true);
              }
            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 870 }
          }
            , React.createElement('img', {
              src: logoImg,
              alt: "South Point School",
              style: { height: "32px", objectFit: "contain" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 871 }
            }
            )
            , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 875 } }
              , React.createElement('div', {
                style: {
                  color: GOLD,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.1,
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 876 }
              }
                , "South Point School"

              )
              , React.createElement('div', {
                style: {
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 887 }
              }
                , "CANDIDATE PORTAL"

              )
            )
          )
        )
        , React.createElement('div', { className: "flex items-center gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 835 } }
          , React.createElement('div', { style: { position: "relative" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 836 } }
            , React.createElement(Bell, {
              size: 18,
              color: "rgba(255,255,255,0.8)",
              style: { cursor: "pointer" },
              onClick: () => {
                if (activeTab === "resume" && resumeReplaced) {
                  setPendingNavigation({ type: "tab", targetId: "notifications" });
                } else {
                  setActiveTab("notifications");
                }
              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 837 }
            }
            )
            , unreadCount > 0 && (
              React.createElement('span', {
                style: {
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
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 850 }
              }

                , unreadCount
              )
            )
          )
          , React.createElement('div', {
            style: {
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.78rem",
            },
            className: "hidden sm:block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 871 }
          }

            , profile.name
          )
          , React.createElement('button', {
            onClick: () => {
              if (activeTab === "resume" && resumeReplaced) {
                setPendingNavigation({ type: "tab", targetId: "dashboard" });
              } else if (activeTab !== "dashboard") {
                setActiveTab("dashboard");
              } else {
                onClose(true);
              }
            },
            style: {
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
            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 880 }
          }

            , React.createElement(ChevronLeft, { size: 14, color: "#fff", __self: this, __source: { fileName: _jsxFileName, lineNumber: 903 } }), " Back"
          )
        )
      )

      , React.createElement('div', {
        style: { display: "flex", flex: 1, overflow: "hidden" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 908 }
      }

        /* Sidebar Backdrop Overlay on Mobile */
        , React.createElement(AnimatePresence, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 912 } }
          , sidebarOpen && (
            React.createElement(motion.div, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              onClick: () => setSidebarOpen(false),
              style: {
                position: "fixed",
                inset: 0,
                top: "56px",
                zIndex: 998,
                background: "rgba(0,0,0,0.4)",
              },
              className: "md:hidden", __self: this, __source: { fileName: _jsxFileName, lineNumber: 914 }
            }
            )
          )
        )

        /* Sidebar */
        , React.createElement('aside', {
          style: {
            width: "220px",
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          },
          className: `fixed left-0 top-[56px] bottom-0 z-[999] shadow-lg flex transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:relative md:top-0 md:shadow-none md:flex md:translate-x-0`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 932 }
        }

          /* User avatar */
          , React.createElement('div', {
            style: {
              padding: "20px 16px",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "center",
            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 946 }
          }

            /* Profile Picture Circle */
            , React.createElement('div', {
              onClick: () => setShowPhotoPopup(true),
              style: {
                position: "relative",
                width: "64px",
                height: "64px",
                margin: "0 auto 10px",
                cursor: "pointer",
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${MAROON}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, border-color 0.2s",
              },
              className: "hover:scale-105 hover:border-[#c9a84c] group",
              title: "Update profile picture", __self: this, __source: { fileName: _jsxFileName, lineNumber: 954 }
            }

              , profilePic ? (
                React.createElement('img', { src: profilePic, alt: "Profile", style: { width: "100%", height: "100%", objectFit: "cover" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 972 } })
              ) : (
                React.createElement('div', { style: { width: "100%", height: "100%", background: `linear-gradient(135deg, ${MAROON}, #4a0a1a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: "#fff", fontWeight: 700 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 974 } }
                  , profile.name.charAt(0).toUpperCase()
                )
              )
              /* Subtle hover overlay */
              , React.createElement('div', {
                style: {
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                },
                className: "group-hover:opacity-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 979 }
              }
                , "CHANGE"

              )
            )
            , React.createElement('input', {
              ref: picRef,
              type: "file",
              accept: "image/*",
              style: { display: "none" },
              onChange: handlePhotoUpload, __self: this, __source: { fileName: _jsxFileName, lineNumber: 998 }
            }
            )
            , React.createElement('div', { style: { fontWeight: 600, fontSize: "0.875rem", color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1005 } }, profile.name)
            , React.createElement('div', { style: { color: "#6b5c5c", fontSize: "0.72rem", marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1006 } }, "Job Applicant")
          )

          /* Nav */
          , React.createElement('nav', { style: { padding: "12px 8px", flex: 1 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1010 } }
            , [...navItems.filter(n => n.id !== "notifications"), ...navItems.filter(n => n.id === "notifications")].map(({ id, label, icon: Icon }) => (
              React.createElement('button', {
                key: id,
                onClick: () => {
                  if (activeTab === "resume" && resumeReplaced) {
                    setPendingNavigation({ type: "tab", targetId: id });
                  } else {
                    setActiveTab(id);
                    setSidebarOpen(false);
                  }
                },
                style: {
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background:
                    activeTab === id
                      ? `rgba(114,16,42,0.08)`
                      : "transparent",
                  color:
                    activeTab === id ? MAROON : "#4a4a4a",
                  fontWeight: activeTab === id ? 600 : 400,
                  fontSize: "0.82rem",
                  marginBottom: "2px",
                  transition: "all 0.15s",
                  textAlign: "left",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1012 }
              }

                , React.createElement(Icon, { size: 16, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1044 } })
                , label
                , id === "notifications" &&
                unreadCount > 0 && (
                  React.createElement('span', {
                    style: {
                      marginLeft: "auto",
                      background: MAROON,
                      color: "#fff",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      borderRadius: "999px",
                      padding: "1px 6px",
                    }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1048 }
                  }

                    , unreadCount
                  )
                )
              )
            ))
          )

          /* Logout */
          , React.createElement('div', {
            style: {
              padding: "12px 8px",
              borderTop: "1px solid #f0f0f0",
            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1067 }
          }

            , React.createElement('button', {
              onClick: () => {
                if (activeTab === "resume" && resumeReplaced) {
                  setPendingNavigation({ type: "logout" });
                } else {
                  _optionalChain([onLogout, 'optionalCall', _41 => _41()]);
                }
              },
              style: {
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: "#991b1b",
                fontSize: "0.82rem",
                fontWeight: 500,
              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1073 }
            }

              , React.createElement(LogOut, { size: 16, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1096 } }), " Log Out"
            )
          )
        )

        /* Main Content */
        , React.createElement('main', {
          onClick: () => sidebarOpen && setSidebarOpen(false),
          style: {
            flex: 1,
            overflowY: "auto",
          },
          className: "p-4 md:p-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1102 }
        }

          /* Dashboard Overview */
          , activeTab === "dashboard" && (
            React.createElement(motion.div, {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1112 }
            }

              , React.createElement('h1', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1116 }
              }
                , "Welcome back, "
                , profile.name, "!"
              )
              , React.createElement('p', {
                style: {
                  color: "#6b5c5c",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1127 }
              }
                , "Here's an overview of your applications and activity."


              )

              /* Stats */
              , React.createElement('div', {
                style: {
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "14px",
                  marginBottom: "24px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1139 }
              }

                , [
                  {
                    label: "Total Applied",
                    value: dynamicApplications.length,
                    color: MAROON,
                  },
                  {
                    label: "Shortlisted",
                    value: dynamicApplications.filter(
                      (j) => j.status === "Shortlisted",
                    ).length,
                    color: "#065f46",
                  },
                  {
                    label: "Interviews",
                    value: dynamicApplications.filter(
                      (j) => j.status === "Interview Scheduled",
                    ).length,
                    color: "#1e40af",
                  },
                  {
                    label: "Under Review",
                    value: dynamicApplications.filter(
                      (j) => j.status === "Under Review",
                    ).length,
                    color: "#b45309",
                  },
                ].map(({ label, value, color }) => (
                  React.createElement('div', {
                    key: label,
                    style: {
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                    }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1176 }
                  }

                    , React.createElement('div', {
                      style: {
                        color,
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        lineHeight: 1,
                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1186 }
                    }

                      , value
                    )
                    , React.createElement('div', {
                      style: {
                        color: "#6b5c5c",
                        fontSize: "0.72rem",
                        marginTop: "4px",
                        fontWeight: 600,
                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1196 }
                    }

                      , label
                    )
                  )
                ))
              )

              /* Recent Applications */
              , React.createElement('div', {
                style: {
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  overflow: "hidden",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1211 }
              }

                , React.createElement('div', {
                  style: {
                    padding: "16px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1219 }
                }

                  , React.createElement('h2', {
                    style: {
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1a0a0a",
                    }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1228 }
                  }
                    , "Recent Applications"

                  )
                  , React.createElement('button', {
                    onClick: () => setActiveTab("applications"),
                    style: {
                      color: MAROON,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1237 }
                  }
                    , "View All "
                    , React.createElement(ChevronRight, { size: 13, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1251 } })
                  )
                )
                , dynamicApplications.slice(0, 3).map((job) => {
                  const s = statusConfig[job.status] || {
                    color: "#555",
                    bg: "#f5f5f5",
                    icon: null,
                  };
                  return (
                    React.createElement('div', {
                      key: job.id,
                      style: {
                        padding: "14px 20px",
                        borderBottom: "1px solid #f9f9f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1261 }
                    }

                      , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1272 } }
                        , React.createElement('div', {
                          style: {
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#1a0a0a",
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1273 }
                        }

                          , job.title
                        )
                        , React.createElement('div', {
                          style: {
                            color: "#6b5c5c",
                            fontSize: "0.75rem",
                            marginTop: "2px",
                            display: "flex",
                            gap: "10px",
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1282 }
                        }

                          , React.createElement('span', {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1291 }
                          }

                            , React.createElement(Calendar, { size: 11, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1298 } })
                            , job.appliedDate
                          )
                          , React.createElement('span', {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1301 }
                          }

                            , React.createElement(MapPin, { size: 11, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1308 } })
                            , job.location
                          )
                        )
                      )
                      , React.createElement('span', {
                        style: {
                          background: s.bg,
                          color: s.color,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          whiteSpace: "nowrap",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1313 }
                      }

                        , s.icon
                        , job.status
                      )
                    )
                  );
                })
              )
            )
          )

          /* My Applications */
          , activeTab === "applications" && (
            React.createElement(motion.div, {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1339 }
            }

              , React.createElement('h1', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1343 }
              }
                , "My Applications"

              )
              , React.createElement('p', {
                style: {
                  color: "#6b5c5c",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1354 }
              }
                , "Track the status of all your submitted applications."


              )
              , React.createElement('div', {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1364 }
              }

                , dynamicApplications.length === 0 && (
                  React.createElement('div', { style: { textAlign: "center", padding: "40px 20px", color: "#9a8a8a", fontSize: "0.875rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1372 } }
                    , React.createElement(Briefcase, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1373 } })
                    , React.createElement('div', { style: { fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1374 } }, "No applications yet")
                    , React.createElement('div', { style: { marginTop: "4px", fontSize: "0.8rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1375 } }, "Apply for jobs on the careers page to see them here.")
                  )
                )
                , dynamicApplications.map((job) => {
                  const s = statusConfig[job.status] || {
                    color: "#555",
                    bg: "#f5f5f5",
                    icon: null,
                  };
                  return (
                    React.createElement('div', {
                      key: job.id,
                      style: {
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "18px 20px",
                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1385 }
                    }

                      , React.createElement('div', {
                        style: {
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "12px",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1394 }
                      }

                        , React.createElement('div', { style: { flex: 1 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1402 } }
                          , React.createElement('div', {
                            style: {
                              fontFamily:
                                "'Playfair Display', serif",
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: "#1a0a0a",
                              marginBottom: "4px",
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1403 }
                          }

                            , job.title
                          )
                          , React.createElement('div', {
                            style: {
                              color: "#6b5c5c",
                              fontSize: "0.78rem",
                              marginBottom: "10px",
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1415 }
                          }

                            , job.department
                          )
                          , React.createElement('div', {
                            style: {
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "12px",
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1424 }
                          }

                            , React.createElement('span', {
                              style: {
                                color: "#4a4a4a",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1431 }
                            }

                              , React.createElement(Briefcase, {
                                size: 12,
                                color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1440 }
                              }
                              )
                              , job.type
                            )
                            , React.createElement('span', {
                              style: {
                                color: "#4a4a4a",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1446 }
                            }

                              , React.createElement(MapPin, {
                                size: 12,
                                color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1455 }
                              }
                              )
                              , job.location
                            )
                            , React.createElement('span', {
                              style: {
                                color: "#4a4a4a",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1461 }
                            }

                              , React.createElement(Calendar, {
                                size: 12,
                                color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1470 }
                              }
                              ), "Applied: "
                              , job.appliedDate
                            )
                          )
                        )
                        , React.createElement('span', {
                          style: {
                            background: s.bg,
                            color: s.color,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "5px 12px",
                            borderRadius: "999px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1478 }
                        }

                          , s.icon
                          , job.status
                        )
                      )
                      , React.createElement('div', {
                        style: {
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid #f0f0f0",
                          display: "flex",
                          gap: "8px",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1497 }
                      }

                        , React.createElement('button', {
                          onClick: () => {
                            const fullJob = allJobs.find((j) => j.id === job.id);
                            if (fullJob) setSelectedJobDesc(fullJob);
                          },
                          style: {
                            fontSize: "0.75rem",
                            color: MAROON,
                            fontWeight: 600,
                            background: "none",
                            border: `1px solid ${MAROON}`,
                            borderRadius: "6px",
                            padding: "5px 12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1506 }
                        }

                          , React.createElement(Eye, { size: 12, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1525 } }), " View Job Description"
                        )
                      )
                    )
                  );
                })
              )
            )
          )

          /* My Profile & Resume */
          , activeTab === "resume" && (
            React.createElement(motion.div, {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1537 }
            }

              , React.createElement('h1', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1541 }
              }
                , "My Profile & Resume"

              )
              , React.createElement('p', {
                style: {
                  color: "#6b5c5c",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1552 }
              }
                , "Keep your profile updated to improve your chances."


              )

              /* Card 1 — Personal Information */
              , React.createElement('div', {
                ref: personalSectionRef,
                style: {
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "16px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1564 }
              }

                , React.createElement('h2', {
                  style: {
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: MAROON,
                    marginBottom: "16px",
                    fontFamily: "'Playfair Display', serif",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1574 }
                }
                  , "Personal Information"

                )
                , React.createElement('div', { style: { gap: "14px" }, className: "grid grid-cols-1 sm:grid-cols-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1585 } }
                  /* First Name */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1587 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1588 } }, "First Name")
                    , React.createElement('input', {
                      value: profile.name,
                      onChange: (e) => setProfile({ ...profile, name: capitalizeWords(e.target.value) }),
                      placeholder: "First name",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1589 }
                    }
                    )
                  )
                  /* Last Name */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1597 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1598 } }, "Last Name")
                    , React.createElement('input', {
                      value: profile.lastName,
                      onChange: (e) => setProfile({ ...profile, lastName: capitalizeWords(e.target.value) }),
                      placeholder: "Last name",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1599 }
                    }
                    )
                  )
                  /* Email with OTP change flow */
                  , React.createElement('div', { style: { gridColumn: "1 / -1" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1607 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1608 } }, "Email Address")
                    , !emailEdit ? (
                      React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1610 } }
                        , React.createElement('input', { value: profile.email, readOnly: true, style: { flex: 1, padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#f3f4f6", color: "#6b5c5c", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1611 } })
                        , React.createElement('button', {
                          onClick: () => { setEmailEdit(true); setNewEmail(""); setOtpSent(false); setEnteredOtp(""); setOtpError(""); setEmailVerified(false); },
                          style: { background: MAROON, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1612 }
                        }, "Change Email"

                        )
                      )
                    ) : emailVerified ? (
                      React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1618 } }
                        , React.createElement(CheckCircle, { size: 16, color: "#065f46", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1619 } })
                        , React.createElement('span', { style: { fontSize: "0.85rem", color: "#065f46", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1620 } }, "Email updated to ", profile.email)
                      )
                    ) : (
                      React.createElement('div', { style: { display: "flex", flexDirection: "column", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1623 } }
                        , React.createElement('div', { style: { display: "flex", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1624 } }
                          , React.createElement('input', {
                            type: "email", value: newEmail, onChange: (e) => setNewEmail(e.target.value), placeholder: "Enter new email address",
                            style: { flex: 1, padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1625 }
                          })
                          , !otpSent ? (
                            React.createElement('button', {
                              onClick: () => { if (newEmail) { setOtpSent(true); setOtpError(""); } },
                              style: { background: MAROON, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1628 }
                            }, "Send OTP"

                            )
                          ) : (
                            React.createElement('button', {
                              onClick: () => { setOtpSent(false); setEnteredOtp(""); setOtpError(""); },
                              style: { background: "transparent", color: MAROON, border: `1px solid ${MAROON}`, borderRadius: "8px", padding: "9px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1633 }
                            }, "Resend"

                            )
                          )
                        )
                        , otpSent && (
                          React.createElement(React.Fragment, null
                            , React.createElement('div', { style: { fontSize: "0.75rem", color: "#065f46", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", border: "1px solid #6ee7b7" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1641 } }, "OTP sent to "
                              , React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1642 } }, newEmail), ". Enter the OTP you received."
                            )
                            , React.createElement('div', { style: { display: "flex", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1644 } }
                              , React.createElement('input', {
                                value: enteredOtp, onChange: (e) => setEnteredOtp(e.target.value.slice(0, 6)), placeholder: "Enter 6-digit OTP", maxLength: 6, inputMode: "numeric",
                                style: { flex: 1, padding: "9px 12px", border: `1.5px solid ${otpError ? "#fca5a5" : "#e5e7eb"}`, borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", letterSpacing: "0.15em", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1645 }
                              })
                              , React.createElement('button', {
                                onClick: () => {
                                  if (enteredOtp.length > 0) {
                                    setProfile({ ...profile, email: newEmail });
                                    setEmailVerified(true);
                                    setEmailEdit(false);
                                    setOtpError("");
                                  } else {
                                    setOtpError("Please enter the OTP.");
                                  }
                                }, style: { background: "#065f46", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1647 }
                              }, "Verify OTP"

                              )
                            )
                            , otpError && React.createElement('div', { style: { color: "#991b1b", fontSize: "0.75rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1660 } }, otpError)
                          )
                        )
                        , React.createElement('button', {
                          onClick: () => { setEmailEdit(false); setOtpSent(false); setEnteredOtp(""); setOtpError(""); },
                          style: { alignSelf: "flex-start", background: "transparent", color: "#6b5c5c", border: "none", fontSize: "0.75rem", cursor: "pointer", padding: 0, textDecoration: "underline" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1663 }
                        }, "Cancel"

                        )
                      )
                    )
                  )
                  /* Phone */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1671 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1672 } }, "Phone Number")
                    , React.createElement('input', {
                      value: profile.phone,
                      inputMode: "numeric",
                      maxLength: 10,
                      minLength: 10,
                      pattern: "\\d{10}",
                      onChange: (e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }),
                      placeholder: "Enter a number",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1673 }
                    }
                    )
                  )
                  /* Location */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1685 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1686 } }, "Current Location")
                    , React.createElement('input', {
                      value: profile.location,
                      onChange: (e) => setProfile({ ...profile, location: e.target.value }),
                      placeholder: "Guwahati, Assam",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1687 }
                    }
                    )
                  )
                )
              )

              /* Card 2 — Professional Information */
              , React.createElement('div', {
                ref: professionalSectionRef,
                style: {
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "16px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1698 }
              }

                , React.createElement('h2', {
                  style: {
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: MAROON,
                    marginBottom: "16px",
                    fontFamily: "'Playfair Display', serif",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1708 }
                }
                  , "Professional Information"

                )
                , React.createElement('div', { style: { gap: "14px" }, className: "grid grid-cols-1 sm:grid-cols-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1719 } }
                  /* Educational Qualification (mandatory) */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1721 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1722 } }, "Educational Qualification ", React.createElement('span', { style: { color: MAROON }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1722 } }, "*"))
                    , React.createElement('select', {
                      value: profile.highestEducation,
                      onChange: (e) => setProfile({ ...profile, highestEducation: e.target.value }),
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1723 }
                    }

                      , React.createElement('option', { value: "", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1728 } }, "Select education")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1729 } }, "High School / 12th")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1730 } }, "Diploma")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1731 } }, "Bachelor's Degree")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1732 } }, "Master's Degree")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1733 } }, "M.Phil")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1734 } }, "PhD / Doctorate")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1735 } }, "B.Ed / M.Ed")
                    )
                  )

                  /* Degree Name */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1740 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1741 } }, "Degree Name")
                    , React.createElement('input', {
                      value: profile.degreeName,
                      onChange: (e) => setProfile({ ...profile, degreeName: e.target.value }),
                      placeholder: "e.g. M.Sc Mathematics",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1742 }
                    }
                    )
                  )

                  /* Professional Qualification */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1751 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1752 } }, "Professional Qualification ", React.createElement('span', { style: { fontWeight: 400, color: "#9a8a8a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1752 } }, "(Optional)"))
                    , React.createElement('select', {
                      value: profile.professionalQualification,
                      onChange: (e) => setProfile({ ...profile, professionalQualification: e.target.value }),
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1753 }
                    }

                      , React.createElement('option', { value: "", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1758 } }, "Select qualification")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1759 } }, "B.Ed (Bachelor of Education)")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1760 } }, "M.Ed (Master of Education)")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1761 } }, "CTET / STET Certified")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1762 } }, "NET / SET Qualified")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1763 } }, "NTT (Nursery Teacher Training)")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1764 } }, "D.El.Ed (Diploma in Elementary Education)")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1765 } }, "PG Diploma in Education")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1766 } }, "Other")
                    )
                  )
                  /* Degree Name */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1770 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1771 } }, "Degree Name")
                    , React.createElement('input', {
                      value: profile.professionalQualificationOther,
                      onChange: (e) => setProfile({ ...profile, professionalQualificationOther: e.target.value }),
                      placeholder: "e.g. B.Ed, CTET, NET",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1772 }
                    }
                    )
                  )

                  /* Years of Experience */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1781 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1782 } }, "Years of Experience")
                    , React.createElement('select', {
                      value: profile.experience,
                      onChange: (e) => setProfile({ ...profile, experience: e.target.value }),
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1783 }
                    }

                      , React.createElement('option', { value: "", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1788 } }, "Select experience")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1789 } }, "0–1 years (Fresher)")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1790 } }, "1–3 years")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1791 } }, "3–5 years")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1792 } }, "5–8 years")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1793 } }, "8+ years")
                    )
                  )

                  /* Extracurricular Qualification */
                  , React.createElement('div', { className: "sm:col-start-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1798 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1799 } }, "Extracurricular Qualification ", React.createElement('span', { style: { fontWeight: 400, color: "#9a8a8a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1799 } }, "(Optional)"))
                    , React.createElement('select', {
                      value: profile.extracurricular,
                      onChange: (e) => setProfile({ ...profile, extracurricular: e.target.value }),
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1800 }
                    }

                      , React.createElement('option', { value: "", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1805 } }, "Select qualification")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1806 } }, "Sports Coaching")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1807 } }, "Music / Performing Arts")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1808 } }, "Drama / Theatre")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1809 } }, "Visual Arts / Craft")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1810 } }, "Debate / Public Speaking")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1811 } }, "Yoga / Physical Education")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1812 } }, "Scouting / NCC")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1813 } }, "Community Service / Social Work")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1814 } }, "STEM / Robotics Club")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1815 } }, "Environmental Activities")
                      , React.createElement('option', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1816 } }, "Other")
                    )
                  )
                  /* Degree Name */
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1820 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1821 } }, "Degree Name")
                    , React.createElement('input', {
                      value: profile.extracurricularOther,
                      onChange: (e) => setProfile({ ...profile, extracurricularOther: e.target.value }),
                      placeholder: "e.g. Sports Coach, Music Diploma",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1822 }
                    }
                    )
                  )
                )
                /* Roles Interested In — full width */
                , React.createElement('div', { style: { marginTop: "14px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1831 } }
                  , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1832 } }, "Roles Interested In")
                  , React.createElement(SkillsMultiSelect, { selected: profile.roles, onChange: (v) => setProfile({ ...profile, roles: v }), __self: this, __source: { fileName: _jsxFileName, lineNumber: 1833 } })
                )
                /* Skills & Strengths — full width */
                , React.createElement('div', { style: { marginTop: "14px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1836 } }
                  , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1837 } }, "Skills & Strengths")
                  , React.createElement(SkillsMultiSelect, { selected: profile.skills, onChange: (v) => setProfile({ ...profile, skills: v }), __self: this, __source: { fileName: _jsxFileName, lineNumber: 1838 } })
                )
                /* Salary Expectations + LinkedIn + Portfolio */
                , React.createElement('div', { style: { marginTop: "14px", gap: "14px" }, className: "grid grid-cols-1 sm:grid-cols-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1841 } }
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1842 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1843 } }, "Salary Expectations (₹ per annum)")
                    , React.createElement('select', {
                      value: profile.salary,
                      onChange: (e) => setProfile({ ...profile, salary: e.target.value }),
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1844 }
                    }

                      , React.createElement('option', { value: "", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1849 } }, "Select expected salary")
                      , React.createElement('option', { value: "200000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1850 } }, "₹2,00,000")
                      , React.createElement('option', { value: "300000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1851 } }, "₹3,00,000")
                      , React.createElement('option', { value: "400000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1852 } }, "₹4,00,000")
                      , React.createElement('option', { value: "500000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1853 } }, "₹5,00,000")
                      , React.createElement('option', { value: "600000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1854 } }, "₹6,00,000")
                      , React.createElement('option', { value: "700000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1855 } }, "₹7,00,000")
                      , React.createElement('option', { value: "800000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1856 } }, "₹8,00,000")
                      , React.createElement('option', { value: "1000000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1857 } }, "₹10,00,000")
                      , React.createElement('option', { value: "1200000", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1858 } }, "₹12,00,000+")
                    )
                  )
                  , React.createElement('div', { className: "hidden sm:block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1861 } })
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1862 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1863 } }, "LinkedIn Profile ", React.createElement('span', { style: { fontWeight: 400, color: "#9a8a8a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1863 } }, "(Optional)"))
                    , React.createElement('input', {
                      value: profile.linkedin, onChange: (e) => setProfile({ ...profile, linkedin: e.target.value }), placeholder: "https://linkedin.com/in/yourname",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1864 }
                    })
                  )
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1867 } }
                    , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1868 } }, "Portfolio / GitHub / Other ", React.createElement('span', { style: { fontWeight: 400, color: "#9a8a8a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1868 } }, "(Optional)"))
                    , React.createElement('input', {
                      value: profile.portfolio, onChange: (e) => setProfile({ ...profile, portfolio: e.target.value }), placeholder: "https://github.com/username",
                      style: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1869 }
                    })
                  )
                )
              )

              /* CV / Resume — last section */
              , React.createElement('div', { ref: resumeSectionRef, style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1876 } }
                , React.createElement('h2', { style: { fontWeight: 700, fontSize: "0.95rem", color: MAROON, marginBottom: "16px", fontFamily: "'Playfair Display', serif" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1877 } }, "CV / Resume")
                , React.createElement('div', { style: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", marginBottom: "16px", background: "#faf8f5" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1878 } }
                  , React.createElement('div', { style: { fontWeight: 600, fontSize: "0.85rem", color: "#1a0a0a", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1879 } }, "Current Resume")
                  , resumeFile ? (
                    React.createElement(React.Fragment, null
                      , React.createElement('div', { style: { fontSize: "0.8rem", color: "#6b5c5c", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1882 } }
                        , React.createElement(FileText, { size: 13, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1883 } }), " ", resumeFile
                      )
                      , React.createElement('div', { style: { display: "flex", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1885 } }
                        , React.createElement('button', { onClick: handleViewResume, style: { border: `1px solid ${MAROON}`, color: MAROON, background: "white", borderRadius: "6px", padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1886 } }
                          , React.createElement(Eye, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1887 } }), " View Resume"
                        )
                        , React.createElement('a', { href: resumeUrl || "#", download: resumeFile, style: { border: `1px solid ${MAROON}`, color: MAROON, background: "white", borderRadius: "6px", padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", textDecoration: "none" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1889 } }
                          , React.createElement(Download, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1890 } }), " Download"
                        )
                      )
                    )
                  ) : (
                    React.createElement('div', { style: { fontSize: "0.8rem", color: "#9a8a8a", fontStyle: "italic" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1895 } }, "No resume uploaded yet.")
                  )
                )
                , React.createElement('div', { onClick: () => _optionalChain([fileRef, 'access', _42 => _42.current, 'optionalAccess', _43 => _43.click, 'call', _44 => _44()]), style: { border: `2px dashed ${MAROON}`, borderRadius: "10px", padding: "24px", textAlign: "center", cursor: "pointer", background: "#fdf8f9" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1898 } }
                  , React.createElement(Upload, { size: 28, style: { color: MAROON, margin: "0 auto 10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1899 } })
                  , React.createElement('div', { style: { fontWeight: 600, fontSize: "0.875rem", color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1900 } }, resumeFile ? "Replace Resume" : "Upload Resume")
                  , React.createElement('div', { style: { color: "#6b5c5c", fontSize: "0.75rem", marginTop: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1901 } }, "PDF, DOC or DOCX • Maximum 5 MB")
                  , fileSizeError && React.createElement('div', { style: { color: "#d00", fontSize: "0.75rem", marginTop: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1902 } }, fileSizeError)
                  , React.createElement('input', { ref: fileRef, type: "file", accept: ".pdf,.doc,.docx", style: { display: "none" }, onChange: handleResumeUpload, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1903 } })
                )
              )

              /* Save Changes */
              , React.createElement('button', { onClick: handleSave, style: { background: MAROON, color: "#fff", fontWeight: 600, fontSize: "0.85rem", border: "none", borderRadius: "8px", padding: "10px 28px", cursor: "pointer", transition: "opacity 0.2s" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1908 } }
                , saved ? "Saved ✓" : "Save Changes"
              )
            )
          )

          /* Notifications */
          , activeTab === "notifications" && (
            React.createElement(motion.div, {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1916 }
            }

              , React.createElement('h1', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1920 }
              }
                , "Notifications"

              )
              , React.createElement('div', {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1931 }
              }

                , notifications.map((n) => (
                  React.createElement('div', {
                    key: n.id,
                    style: {
                      background: n.read ? "#fff" : "#fef9f0",
                      border: `1px solid ${n.read ? "#e5e7eb" : "#fde68a"}`,
                      borderRadius: "10px",
                      padding: "14px 18px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1939 }
                  }

                    , React.createElement('div', {
                      style: {
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: n.read ? "#d1d5db" : GOLD,
                        flexShrink: 0,
                        marginTop: "5px",
                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1951 }
                    }
                    )
                    , React.createElement('div', { style: { flex: 1 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1961 } }
                      , React.createElement('div', {
                        style: {
                          fontSize: "0.85rem",
                          color: "#1a0a0a",
                          lineHeight: 1.5,
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1962 }
                      }

                        , n.text
                      )
                      , React.createElement('div', {
                        style: {
                          fontSize: "0.72rem",
                          color: "#9a8a8a",
                          marginTop: "4px",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1971 }
                      }

                        , n.time
                      )
                    )
                  )
                ))
              )
            )
          )

          /* Onboarding */
          , activeTab === "onboarding" && (
            React.createElement(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1989 } }
              , React.createElement('h1', { style: { fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1990 } }, "Onboarding")
              , React.createElement('p', { style: { color: "#6b5c5c", fontSize: "0.85rem", marginBottom: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1991 } }, "Submit required documents and complete your onboarding process.")

              /* Offer Letter — first */
              , React.createElement('div', { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1994 } }
                , React.createElement('div', { style: { padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1995 } }
                  , React.createElement(PartyPopper, { size: 16, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1996 } })
                  , React.createElement('h2', { style: { fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1997 } }, "Offer Letter")
                )
                , React.createElement('div', { style: { padding: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1999 } }
                  /* Status Banner */
                  , offerAccepted && (
                    React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "10px", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "14px", marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2002 } }
                      , React.createElement(CheckCircle, { size: 20, color: "#065f46", style: { flexShrink: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2003 } })
                      , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2004 } }
                        , React.createElement('div', { style: { fontWeight: 700, fontSize: "0.88rem", color: "#065f46" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2005 } }, "Offer Accepted!")
                        , React.createElement('div', { style: { color: "#374151", fontSize: "0.78rem", marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2006 } }, "Welcome to South Point School. Joining date: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2006 } }, offerLetter.joiningDate))
                      )
                    )
                  )
                  , offerRejected && (
                    React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "10px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "10px", padding: "14px", marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2011 } }
                      , React.createElement(XCircle, { size: 20, color: "#991b1b", style: { flexShrink: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2012 } })
                      , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2013 } }
                        , React.createElement('div', { style: { fontWeight: 700, fontSize: "0.88rem", color: "#991b1b" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2014 } }, "Offer Declined")
                        , React.createElement('div', { style: { color: "#374151", fontSize: "0.78rem", marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2015 } }, "You have declined the offer. Contact HR if this was a mistake.")
                      )
                    )
                  )

                  /* Offer Details */
                  , React.createElement('div', { style: { background: "#fef9f0", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px", marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2021 } }
                    , React.createElement('div', { style: { fontWeight: 700, fontSize: "0.875rem", color: "#1a0a0a", marginBottom: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2022 } }, "Offer Details")
                    , React.createElement('div', { style: { gap: "10px" }, className: "grid grid-cols-1 sm:grid-cols-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2023 } }
                      , [
                        { label: "Position", value: offerLetter.role },
                        { label: "Department", value: offerLetter.department },
                        { label: "Joining Date", value: offerLetter.joiningDate },
                        { label: "Offered CTC", value: offerLetter.salary },
                        { label: "Issued On", value: offerLetter.issuedDate },
                        { label: "Offer Expires", value: offerLetter.expiryDate },
                      ].map(({ label, value }) => (
                        React.createElement('div', { key: label, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2032 } }
                          , React.createElement('div', { style: { color: "#6b5c5c", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2033 } }, label)
                          , React.createElement('div', { style: { color: label === "Offer Expires" ? "#b45309" : "#1a0a0a", fontSize: "0.85rem", fontWeight: 600, marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2034 } }, value)
                        )
                      ))
                    )
                  )

                  /* Button Group */
                  , React.createElement('div', { style: { display: "flex", gap: "10px", flexWrap: "wrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2041 } }
                    /* View Letter: always visible */
                    , React.createElement('button', { style: { border: `1px solid ${MAROON}`, color: MAROON, background: "#fff", borderRadius: "8px", padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2043 } }
                      , React.createElement(Eye, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2044 } }), " View Letter"
                    )

                    /* Download PDF: visible if not declined */
                    , !offerRejected && (
                      React.createElement('button', { style: { border: `1px solid ${MAROON}`, color: MAROON, background: "#fff", borderRadius: "8px", padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2049 } }
                        , React.createElement(Download, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2050 } }), " Download PDF"
                      )
                    )

                    /* Accept Offer: visible only if pending */
                    , !offerAccepted && !offerRejected && (
                      React.createElement('button', { onClick: () => setShowOfferConfirm("accept"), style: { background: "#065f46", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2056 } }
                        , React.createElement(CheckCircle, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2057 } }), " Accept Offer"
                      )
                    )

                    /* Decline Offer: visible only if pending */
                    , !offerAccepted && !offerRejected && (
                      React.createElement('button', { onClick: () => setShowOfferConfirm("reject"), style: { background: "#fff", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600, marginLeft: "auto" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2063 } }
                        , React.createElement(XCircle, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2064 } }), " Decline Offer"
                      )
                    )
                  )

                  /* Confirmation boxes */
                  , showOfferConfirm === "accept" && (
                    React.createElement('div', { style: { marginTop: "14px", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2071 } }
                      , React.createElement('div', { style: { fontWeight: 600, fontSize: "0.875rem", color: "#065f46", marginBottom: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2072 } }, "Confirm acceptance of the offer for ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2072 } }, offerLetter.role), "?")
                      , React.createElement('div', { style: { display: "flex", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2073 } }
                        , React.createElement('button', { onClick: () => { setOfferAccepted(true); setShowOfferConfirm(null); }, style: { background: "#065f46", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2074 } }, "Yes, Accept")
                        , React.createElement('button', { onClick: () => setShowOfferConfirm(null), style: { background: "#fff", border: "1px solid #d1d5db", color: "#4a4a4a", borderRadius: "6px", padding: "8px 16px", cursor: "pointer", fontSize: "0.82rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2075 } }, "Cancel")
                      )
                    )
                  )
                  , showOfferConfirm === "reject" && (
                    React.createElement('div', { style: { marginTop: "14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "10px", padding: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2080 } }
                      , React.createElement('div', { style: { fontWeight: 600, fontSize: "0.875rem", color: "#991b1b", marginBottom: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2081 } }, "Are you sure you want to decline the offer for ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2081 } }, offerLetter.role), "? This cannot be undone.")
                      , React.createElement('div', { style: { display: "flex", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2082 } }
                        , React.createElement('button', { onClick: () => { setOfferRejected(true); setShowOfferConfirm(null); }, style: { background: "#991b1b", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2083 } }, "Yes, Decline")
                        , React.createElement('button', { onClick: () => setShowOfferConfirm(null), style: { background: "#fff", border: "1px solid #d1d5db", color: "#4a4a4a", borderRadius: "6px", padding: "8px 16px", cursor: "pointer", fontSize: "0.82rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2084 } }, "Cancel")
                      )
                    )
                  )
                )
              )

              /* Document Uploads — shown only after offer accepted */
              , offerAccepted && React.createElement('div', { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2092 } }
                , React.createElement('div', { style: { padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2093 } }
                  , React.createElement(Upload, { size: 16, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2094 } })
                  , React.createElement('h2', { style: { fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2095 } }, "Required Documents")
                )
                , React.createElement('div', { style: { padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2097 } }
                  , (() => {
                    const renderDoc = ({ key, label, accept, note }) => {
                      const uploaded = docs[key];
                      const verif = docsSubmitted && uploaded ? (docStatus[key] || "pending") : null;
                      const verifConfig = {
                        verified: { label: "Verified", color: "#065f46", bg: "#f0fdf4", border: "#6ee7b7", icon: React.createElement(CheckCircle, { size: 11, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2103 } }) },
                        pending: { label: "Under Review", color: "#b45309", bg: "#fef3c7", border: "#fde68a", icon: React.createElement(Clock, { size: 11, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2104 } }) },
                        rejected: { label: "Rejected", color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: React.createElement(XCircle, { size: 11, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2105 } }) },
                      };
                      return (
                        React.createElement('div', { key: key, style: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2108 } }
                          , React.createElement('div', { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2109 } }
                            , React.createElement('div', { style: { flex: 1 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2110 } }
                              , React.createElement('div', { style: { fontWeight: 600, fontSize: "0.85rem", color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2111 } }, label)
                              , React.createElement('div', { style: { color: "#9a8a8a", fontSize: "0.72rem", marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2112 } }, uploaded ? uploaded : note)
                            )
                            , React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2114 } }
                              , uploaded ? (
                                React.createElement(React.Fragment, null
                                  , React.createElement('div', { style: { background: "#f0fdf4", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2117 } }
                                    , React.createElement(CheckCircle, { size: 12, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2118 } }), " Uploaded"
                                  )
                                  , React.createElement('button', {
                                    onClick: () => {
                                      const url = docUrls[key];
                                      if (url) {
                                        window.open(url, "_blank");
                                      } else {
                                        toast.info(`Previewing ${label} (${uploaded})`);
                                      }
                                    },
                                    style: { background: "#fff", border: `1.5px solid #e5e7eb`, color: "#4a4a4a", borderRadius: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" },
                                    className: "hover:bg-[#f0f0f0]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2120 }
                                  }

                                    , React.createElement(Eye, { size: 12, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2132 } }), " View"
                                  )
                                  , !docsSubmitted && (
                                    React.createElement('button', {
                                      onClick: () => {
                                        setDocs((prev) => {
                                          const copy = { ...prev };
                                          delete copy[key];
                                          return copy;
                                        });
                                        setDocUrls((prev) => {
                                          const copy = { ...prev };
                                          delete copy[key];
                                          return copy;
                                        });
                                      },
                                      style: { background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" },
                                      title: "Remove document", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2135 }
                                    }

                                      , React.createElement(Trash2, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2151 } })
                                    )
                                  )
                                )
                              ) : !docsSubmitted ? (
                                React.createElement(React.Fragment, null
                                  , React.createElement('label', { style: { cursor: "pointer" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2157 } }
                                    , React.createElement('div', { style: { background: `rgba(114,16,42,0.07)`, border: `1px solid ${MAROON}`, color: MAROON, borderRadius: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2158 } }
                                      , React.createElement(Upload, { size: 12, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2159 } }), " Upload File"
                                    )
                                    , React.createElement('input', {
                                      type: "file", accept: accept, style: { display: "none" }, onChange: (e) => {
                                        const f = _optionalChain([e, 'access', _45 => _45.target, 'access', _46 => _46.files, 'optionalAccess', _47 => _47[0]]);
                                        if (f) {
                                          const url = URL.createObjectURL(f);
                                          setDocs((prev) => ({ ...prev, [key]: f.name }));
                                          setDocUrls((prev) => ({ ...prev, [key]: url }));
                                        }
                                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2161 }
                                    })
                                  )
                                  , React.createElement('button', {
                                    onClick: () => startDocCamera(key),
                                    style: { background: "#faf8f5", border: "1.5px solid #e5e7eb", color: "#4a4a4a", borderRadius: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", cursor: "pointer" },
                                    className: "hover:bg-[#f0f0f0]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2170 }
                                  }

                                    , React.createElement(Camera, { size: 12, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2175 } }), " Take Photo"
                                  )
                                )
                              ) : (
                                React.createElement('span', { style: { color: "#dc2626", fontSize: "0.75rem", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2179 } }, "Missing document")
                              )
                            )
                          )

                          /* Aadhaar Number input field */
                          , key === "aadhar" && (
                            React.createElement('div', { style: { marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2186 } }
                              , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2187 } }, "Aadhaar Number "
                                , React.createElement('span', { style: { color: MAROON }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2188 } }, "*")
                              )
                              , React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2190 } }
                                , React.createElement('input', {
                                  type: "text",
                                  value: aadharNumber,
                                  disabled: docsSubmitted,
                                  onChange: (e) => {
                                    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 12);
                                    const formatted = rawVal.replace(/(\d{4})(?=\d)/g, "$1 ");
                                    setAadharNumber(formatted);
                                  },
                                  placeholder: "1234 5678 9012",
                                  style: {
                                    width: "100%",
                                    maxWidth: "260px",
                                    padding: "8px 12px",
                                    border: `1.5px solid ${aadharNumber.replace(/\s/g, "").length === 12 ? "#065f46" : "#e5e7eb"}`,
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    outline: "none",
                                    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                                    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                                    cursor: docsSubmitted ? "not-allowed" : "text",
                                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2191 }
                                }
                                )
                                , aadharNumber.replace(/\s/g, "").length === 12 ? (
                                  React.createElement('span', { style: { color: "#065f46", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2215 } }
                                    , React.createElement(CheckCircle, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2216 } }), " Valid format (12 digits)"
                                  )
                                ) : aadharNumber.replace(/\s/g, "").length > 0 ? (
                                  React.createElement('span', { style: { color: "#dc2626", fontSize: "0.75rem", fontWeight: 500 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2219 } }, "Enter 12 digits ("
                                    , 12 - aadharNumber.replace(/\s/g, "").length, " remaining)"
                                  )
                                ) : (
                                  React.createElement('span', { style: { color: "#6b5c5c", fontSize: "0.72rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2223 } }, "Format: 12-digit number"

                                  )
                                )
                              )
                            )
                          )

                          /* PAN Number input field */
                          , key === "pan" && (
                            React.createElement('div', { style: { marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2233 } }
                              , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2234 } }, "PAN Number "
                                , React.createElement('span', { style: { color: MAROON }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2235 } }, "*")
                              )
                              , React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2237 } }
                                , React.createElement('input', {
                                  type: "text",
                                  value: panNumber,
                                  disabled: docsSubmitted,
                                  onChange: (e) => {
                                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                                    setPanNumber(val);
                                  },
                                  placeholder: "ABCDE1234F",
                                  style: {
                                    width: "100%",
                                    maxWidth: "260px",
                                    padding: "8px 12px",
                                    border: `1.5px solid ${/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? "#065f46" : "#e5e7eb"}`,
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    outline: "none",
                                    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                                    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                                    cursor: docsSubmitted ? "not-allowed" : "text",
                                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2238 }
                                }
                                )
                                , /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? (
                                  React.createElement('span', { style: { color: "#065f46", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2261 } }
                                    , React.createElement(CheckCircle, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2262 } }), " Valid format (ABCDE1234F)"
                                  )
                                ) : panNumber.length > 0 ? (
                                  React.createElement('span', { style: { color: "#dc2626", fontSize: "0.75rem", fontWeight: 500 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2265 } }, "Must match alphanumeric format (e.g. ABCDE1234F)"

                                  )
                                ) : (
                                  React.createElement('span', { style: { color: "#6b5c5c", fontSize: "0.72rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2269 } }, "Format: 10 characters (e.g. ABCDE1234F)"

                                  )
                                )
                              )
                            )
                          )

                          /* Bank Details input fields */
                          , key === "bank_details" && (
                            React.createElement('div', { style: { marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2279 } }
                              , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2280 } }, "Bank Account Details "
                                , React.createElement('span', { style: { color: MAROON }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2281 } }, "*")
                              )
                              , React.createElement('div', { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2283 } }
                                , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2284 } }
                                  , React.createElement('input', { type: "text", value: bankHolder, disabled: docsSubmitted, onChange: (e) => setBankHolder(e.target.value), placeholder: "Account Holder's Name", style: { width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: docsSubmitted ? "#f3f4f6" : "#faf8f5", color: docsSubmitted ? "#6b5c5c" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2285 } })
                                )
                                , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2287 } }
                                  , React.createElement('input', { type: "text", value: bankAccount, disabled: docsSubmitted, onChange: (e) => setBankAccount(e.target.value.replace(/\D/g, "")), placeholder: "Account Number", style: { width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: docsSubmitted ? "#f3f4f6" : "#faf8f5", color: docsSubmitted ? "#6b5c5c" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2288 } })
                                )
                                , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2290 } }
                                  , React.createElement('input', { type: "text", value: bankIfsc, disabled: docsSubmitted, onChange: (e) => setBankIfsc(e.target.value.toUpperCase()), placeholder: "IFSC Code", style: { width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: docsSubmitted ? "#f3f4f6" : "#faf8f5", color: docsSubmitted ? "#6b5c5c" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2291 } })
                                )
                                , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2293 } }
                                  , React.createElement('input', { type: "text", value: bankName, disabled: docsSubmitted, onChange: (e) => setBankName(e.target.value), placeholder: "Bank Name", style: { width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: docsSubmitted ? "#f3f4f6" : "#faf8f5", color: docsSubmitted ? "#6b5c5c" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2294 } })
                                )
                              )
                            )
                          )

                          , verif && (
                            React.createElement('div', { style: { marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "5px", background: verifConfig[verif].bg, border: `1px solid ${verifConfig[verif].border}`, color: verifConfig[verif].color, fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2301 } }
                              , verifConfig[verif].icon, " ", verifConfig[verif].label
                            )
                          )
                        )
                      );
                    };

                    return (
                      React.createElement(React.Fragment, null
                        , React.createElement('h3', { style: { fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2311 } }, "Compulsory Details")
                        , React.createElement('div', { style: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2312 } }
                          , [
                            { key: "aadhar", label: "Aadhaar Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Front & back scan — PDF or image" },
                            { key: "pan", label: "PAN Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Required for salary processing" },
                            { key: "bank_details", label: "Bank Details *", accept: ".pdf,.jpg,.jpeg,.png", note: "Passbook or cancelled cheque" },
                            { key: "photo", label: "Passport Size Photo *", accept: ".jpg,.jpeg,.png", note: "White background, recent photo" },
                          ].map(renderDoc)
                        )

                        , React.createElement('h3', { style: { fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2321 } }, "Optional Details")
                        , React.createElement('div', { style: { display: "flex", flexDirection: "column", gap: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2322 } }
                          , React.createElement('div', { style: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2323 } }
                            , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2324 } }
                              , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2325 } }, "PF Number")
                              , React.createElement('input', { type: "text", value: pfNumber, disabled: docsSubmitted, onChange: (e) => setPfNumber(e.target.value.replace(/\D/g, "")), placeholder: "Enter PF Number", style: { width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: docsSubmitted ? "#f3f4f6" : "#faf8f5", color: docsSubmitted ? "#6b5c5c" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2326 } })
                            )
                            , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2328 } }
                              , React.createElement('label', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2329 } }, "ESI Number")
                              , React.createElement('input', { type: "text", value: esiNumber, disabled: docsSubmitted, onChange: (e) => setEsiNumber(e.target.value.replace(/\D/g, "")), placeholder: "Enter ESI Number", style: { width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: docsSubmitted ? "#f3f4f6" : "#faf8f5", color: docsSubmitted ? "#6b5c5c" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2330 } })
                            )
                          )
                          , [
                            { key: "driving_license", label: "Driving License", accept: ".pdf,.jpg,.jpeg,.png", note: "Valid driving license (Optional)" },
                            { key: "class10", label: "Class 10 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
                            { key: "class12", label: "Class 12 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
                            { key: "degree", label: "Degree / Graduation Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Final degree or provisional certificate (Optional)" },
                            { key: "experience_cert", label: "Experience Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "From previous employer (Optional)" },
                            { key: "prof_cert", label: "Professional Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Any relevant professional certificate (Optional)" },
                          ].map(renderDoc)
                        )
                      )
                    );
                  })()

                  /* Submit Button or Status Notice */
                  , docsSubmitted ? (
                    React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "10px", background: "#fef9f0", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px", marginTop: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2348 } }
                      , React.createElement(Clock, { size: 20, color: "#b45309", style: { flexShrink: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2349 } })
                      , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2350 } }
                        , React.createElement('div', { style: { fontWeight: 700, fontSize: "0.88rem", color: "#b45309" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2351 } }, "Documents Under Review")
                        , React.createElement('div', { style: { color: "#374151", fontSize: "0.78rem", marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2352 } }, "Your documents have been submitted and are currently under review by HR.")
                      )
                    )
                  ) : (
                    React.createElement('div', { style: { display: "flex", justifyContent: "flex-end", marginTop: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2356 } }
                      , React.createElement('button', {
                        onClick: handleSubmitDocs,
                        style: {
                          background: MAROON,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px 24px",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        },
                        className: "hover:opacity-90", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2357 }
                      }
                        , "Submit Documents"

                      )
                    )
                  )
                )
              )

              /* Onboarding Progress */
              , React.createElement('div', { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2380 } }
                , React.createElement('div', { style: { padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2381 } }
                  , React.createElement(ClipboardCheck, { size: 16, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2382 } })
                  , React.createElement('h2', { style: { fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2383 } }, "Onboarding Progress")
                )
                , React.createElement('div', { style: { padding: "16px 20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2385 } }
                  , (() => {
                    const uploadedKeys = Object.keys(docs);
                    const allRequiredUploaded = docsSubmitted;
                    const anyUploadedAndVerified = uploadedKeys.some(k => docStatus[k] === "verified");
                    const steps = [
                      { label: "Profile Submitted", done: true, desc: "Your basic profile has been received." },
                      { label: "Offer Letter Accepted", done: offerAccepted, desc: "Accept your offer letter to proceed." },
                      { label: "Documentation Upload", done: allRequiredUploaded, desc: "Upload all required documents after accepting the offer." },
                      { label: "Document Verification", done: anyUploadedAndVerified, desc: "HR will verify your submitted documents." },
                      { label: "Background Check", done: false, desc: "HR will initiate a background verification." },
                      { label: "Joining Confirmation", done: false, desc: "You will receive a final confirmation email." },
                    ];
                    const completedCount = steps.filter(s => s.done).length;
                    const pct = Math.round((completedCount / steps.length) * 100);
                    return (
                      React.createElement(React.Fragment, null
                        , React.createElement('div', { style: { marginBottom: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2402 } }
                          , React.createElement('div', { style: { display: "flex", justifyContent: "space-between", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2403 } }
                            , React.createElement('span', { style: { fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2404 } }, "Overall Progress")
                            , React.createElement('span', { style: { fontSize: "0.78rem", fontWeight: 700, color: MAROON }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2405 } }, pct, "%")
                          )
                          , React.createElement('div', { style: { background: "#f0f0f0", borderRadius: "999px", height: "8px", overflow: "hidden" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2407 } }
                            , React.createElement('div', { style: { background: MAROON, width: `${pct}%`, height: "100%", borderRadius: "999px", transition: "width 0.4s" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2408 } })
                          )
                        )
                        , steps.map(({ label, done, desc }, idx) => (
                          React.createElement('div', { key: label, style: { display: "flex", gap: "12px", padding: "10px 0", borderBottom: idx < steps.length - 1 ? "1px solid #f9f9f9" : "none" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2412 } }
                            , React.createElement('div', { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2413 } }
                              , React.createElement('div', { style: { width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${done ? "#065f46" : "#d1d5db"}`, background: done ? "#065f46" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2414 } }
                                , done ? React.createElement(CheckCircle, { size: 12, color: "#fff", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2415 } }) : React.createElement('span', { style: { fontSize: "0.6rem", color: "#9ca3af", fontWeight: 700 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2415 } }, idx + 1)
                              )
                              , idx < steps.length - 1 && React.createElement('div', { style: { width: "2px", flex: 1, background: done ? "#065f46" : "#e5e7eb", minHeight: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2417 } })
                            )
                            , React.createElement('div', { style: { paddingBottom: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2419 } }
                              , React.createElement('div', { style: { fontSize: "0.85rem", fontWeight: 600, color: done ? "#065f46" : "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2420 } }, label)
                              , React.createElement('div', { style: { fontSize: "0.75rem", color: "#9a8a8a", marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2421 } }, desc)
                            )
                          )
                        ))
                      )
                    );
                  })()
                )
              )

              /* HR Contact */
              , React.createElement('div', { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "18px 20px", marginTop: "16px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2432 } }
                , React.createElement('div', { style: { fontWeight: 700, fontSize: "0.9rem", color: "#1a0a0a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2433 } }
                  , React.createElement(User, { size: 15, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2434 } }), " HR Contact"
                )
                , [
                  { label: "HR Manager", value: "Ms. Priya Borah" },
                  { label: "Email", value: "hr@southpointguwahati.in" },
                  { label: "Office Hours", value: "Mon–Fri, 9 AM – 5 PM" },
                ].map(({ label, value }) => (
                  React.createElement('div', { key: label, style: { display: "flex", gap: "10px", fontSize: "0.82rem", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2441 } }
                    , React.createElement('span', { style: { color: "#6b5c5c", minWidth: "90px", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2442 } }, label, ":")
                    , React.createElement('span', { style: { color: "#1a0a0a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2443 } }, value)
                  )
                ))
              )
            )
          )

          /* Upcoming Interviews — separate tab */
          , activeTab === "interviews" && (
            React.createElement(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2452 } }
              , React.createElement('h1', { style: { fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2453 } }, "Upcoming Interviews")
              , React.createElement('p', { style: { color: "#6b5c5c", fontSize: "0.85rem", marginBottom: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2454 } }, "Your scheduled interviews and meeting links.")
              , React.createElement('div', { style: { display: "flex", flexDirection: "column", gap: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2455 } }
                , interviews.length === 0 ? (
                  React.createElement('div', { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#9a8a8a" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2457 } }
                    , React.createElement(Video, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2458 } })
                    , React.createElement('div', { style: { fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2459 } }, "No interviews scheduled yet.")
                  )
                ) : interviews.map((iv) => (
                  React.createElement('div', { key: iv.id, style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2462 } }
                    , React.createElement('div', { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2463 } }
                      , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2464 } }
                        , React.createElement('div', { style: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem", color: "#1a0a0a", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2465 } }, iv.role)
                        , React.createElement('div', { style: { display: "flex", flexWrap: "wrap", gap: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2466 } }
                          , React.createElement('span', { style: { color: "#4a4a4a", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2467 } }, React.createElement(Calendar, { size: 12, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2467 } }), iv.date, " at ", iv.time)
                          , React.createElement('span', { style: { color: "#4a4a4a", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2468 } }, React.createElement(User, { size: 12, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2468 } }), iv.interviewer)
                        )
                        , React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2470 } }
                          , React.createElement('span', { style: { background: iv.mode === "Online" ? "#dbeafe" : "#f0fdf4", color: iv.mode === "Online" ? "#1e40af" : "#065f46", fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2471 } }, iv.mode)
                          , iv.platform && React.createElement('span', { style: { color: "#6b5c5c", fontSize: "0.75rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2472 } }, "via ", iv.platform)
                        )
                      )
                      , React.createElement('span', { style: { background: "#fef3c7", color: "#b45309", fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", flexShrink: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2475 } }, iv.status)
                    )
                    , iv.link && (
                      React.createElement('div', { style: { padding: "12px 16px", background: "#eff6ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2478 } }
                        , React.createElement('div', { style: { display: "flex", alignItems: "center", gap: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2479 } }
                          , React.createElement(Link, { size: 14, color: "#1e40af", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2480 } })
                          , React.createElement('span', { style: { color: "#1e40af", fontSize: "0.8rem", fontWeight: 600 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2481 } }, "Meeting Link")
                          , React.createElement('span', { style: { color: "#6b5c5c", fontSize: "0.75rem" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2482 } }, iv.link)
                        )
                        , React.createElement('a', { href: iv.link, target: "_blank", rel: "noreferrer", style: { background: "#1e40af", color: "#fff", fontSize: "0.78rem", fontWeight: 600, padding: "7px 16px", borderRadius: "6px", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2484 } }
                          , React.createElement(Video, { size: 12, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2485 } }), " Join Interview"
                        )
                      )
                    )
                  )
                ))
              )
            )
          )

          /* Settings */
          , activeTab === "settings" && (
            React.createElement(motion.div, {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2497 }
            }

              , React.createElement('h1', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a0a0a",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2501 }
              }
                , "Settings"

              )
              , React.createElement('div', {
                style: {
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  overflow: "hidden",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2512 }
              }

                , [
                  {
                    label: "Email Notifications",
                    desc: "Receive updates about your applications via email",
                  },
                  {
                    label: "SMS Alerts",
                    desc: "Get text message alerts for interview invitations",
                  },
                  {
                    label: "Profile Visibility",
                    desc: "Allow recruiters to find your profile",
                  },
                ].map(({ label, desc }, i) => (
                  React.createElement('div', {
                    key: label,
                    style: {
                      padding: "16px 20px",
                      borderBottom:
                        i < 2 ? "1px solid #f0f0f0" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2534 }
                  }

                    , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2545 } }
                      , React.createElement('div', {
                        style: {
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#1a0a0a",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2546 }
                      }

                        , label
                      )
                      , React.createElement('div', {
                        style: {
                          color: "#6b5c5c",
                          fontSize: "0.75rem",
                          marginTop: "2px",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2555 }
                      }

                        , desc
                      )
                    )
                    , React.createElement('div', {
                      style: {
                        width: "40px",
                        height: "22px",
                        borderRadius: "999px",
                        background: MAROON,
                        cursor: "pointer",
                        position: "relative",
                        flexShrink: 0,
                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2565 }
                    }

                      , React.createElement('div', {
                        style: {
                          position: "absolute",
                          right: "3px",
                          top: "3px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "#fff",
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2576 }
                      }
                      )
                    )
                  )
                ))
              )
              , React.createElement('div', {
                style: {
                  marginTop: "16px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px 20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2591 }
              }

                , React.createElement('button', {
                  onClick: onClose,
                  style: {
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
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2600 }
                }

                  , React.createElement(LogOut, { size: 14, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2616 } }), " Log Out"
                )
              )
            )
          )
        )
      )

      , React.createElement(AnimatePresence, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2624 } }
        , selectedJobDesc && (
          React.createElement(motion.div, {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            onClick: () => setSelectedJobDesc(null),
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2626 }
          }

            , React.createElement(motion.div, {
              initial: { opacity: 0, y: 30, scale: 0.97 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 20 },
              transition: { duration: 0.3 },
              onClick: (e) => e.stopPropagation(),
              style: {
                position: "relative",
                background: "#fff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "500px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                padding: "28px",
              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2642 }
            }

              /* Close Button */
              , React.createElement('button', {
                onClick: () => setSelectedJobDesc(null),
                style: {
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
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2660 }
              }

                , React.createElement(X, { size: 18, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2676 } })
              )

              /* Title & Department */
              , React.createElement('h2', {
                style: {
                  color: MAROON,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: "6px",
                  paddingRight: "24px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2680 }
              }

                , selectedJobDesc.title
              )
              , React.createElement('div', {
                style: {
                  color: "#6b5c5c",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  marginBottom: "20px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2692 }
              }

                , selectedJobDesc.department, " • ", selectedJobDesc.location
              )

              /* Job Info Pills */
              , React.createElement('div', { style: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2704 } }
                , React.createElement('span', { style: { background: "rgba(114,16,42,0.08)", color: MAROON, fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px", borderRadius: "999px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2705 } }
                  , selectedJobDesc.type
                )
                , React.createElement('span', { style: { background: "rgba(201,168,76,0.12)", color: "#9a781b", fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px", borderRadius: "999px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2708 } }, "Deadline: "
                  , selectedJobDesc.deadline
                )
              )

              /* Description */
              , React.createElement('div', { style: { marginBottom: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2714 } }
                , React.createElement('h4', { style: { fontSize: "0.85rem", fontWeight: 700, color: "#1a0a0a", marginBottom: "6px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2715 } }, "Job Description"

                )
                , React.createElement('p', { style: { fontSize: "0.82rem", color: "#4a4a4a", lineHeight: 1.6 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2718 } }
                  , selectedJobDesc.description
                )
              )

              /* Qualifications */
              , selectedJobDesc.qualifications && selectedJobDesc.qualifications.length > 0 && (
                React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2725 } }
                  , React.createElement('h4', { style: { fontSize: "0.85rem", fontWeight: 700, color: "#1a0a0a", marginBottom: "8px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2726 } }, "Required Qualifications"

                  )
                  , React.createElement('ul', { style: { paddingLeft: "16px", margin: 0 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2729 } }
                    , selectedJobDesc.qualifications.map((qual, idx) => (
                      React.createElement('li', { key: idx, style: { fontSize: "0.82rem", color: "#4a4a4a", lineHeight: 1.6, marginBottom: "4px", listStyleType: "disc" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2731 } }
                        , qual
                      )
                    ))
                  )
                )
              )

              /* Additional Information Submitted */
              , appliedJobIds.includes(selectedJobDesc.id) && (
                React.createElement('div', { style: { marginTop: "20px", borderTop: "1.5px solid #e5e7eb", paddingTop: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2741 } }
                  , React.createElement('h4', { style: { fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2742 } }, "Your Additional Information"

                  )
                  , (() => {
                    const appData = _optionalChain([applicationsData, 'optionalAccess', _48 => _48[selectedJobDesc.id]]) || {
                      coverLetter: "Interested in the position.",
                      noticePeriod: "Immediate",
                      hasReferral: "No",
                      referralEmpId: "",
                    };
                    return (
                      React.createElement('div', { style: { background: "#faf8f5", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2753 } }
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2754 } }
                          , React.createElement('span', { style: { fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2755 } }, "Notice Period")
                          , React.createElement('div', { style: { fontSize: "0.82rem", color: "#1a0a0a", fontWeight: 500, marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2756 } }, appData.noticePeriod)
                        )
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2758 } }
                          , React.createElement('span', { style: { fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2759 } }, "Referral Information")
                          , React.createElement('div', { style: { fontSize: "0.82rem", color: "#1a0a0a", fontWeight: 500, marginTop: "2px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2760 } }
                            , appData.hasReferral === "Yes" ? `Yes (Employee ID: ${appData.referralEmpId})` : "No Referral"
                          )
                        )
                        , appData.coverLetter && (
                          React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2765 } }
                            , React.createElement('span', { style: { fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2766 } }, "Cover Letter / SOP")
                            , React.createElement('div', { style: { fontSize: "0.82rem", color: "#4a4a4a", marginTop: "2px", whiteSpace: "pre-wrap", lineHeight: 1.5 }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2767 } }
                              , appData.coverLetter
                            )
                          )
                        )
                      )
                    );
                  })()
                )
              )

              /* Action Button */
              , React.createElement('div', { style: { marginTop: "24px", display: "flex", justifyContent: "flex-end" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2779 } }
                , React.createElement('button', {
                  onClick: () => setSelectedJobDesc(null),
                  style: {
                    background: MAROON,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2780 }
                }
                  , "Close"

                )
              )
            )
          )
        )
      )

      /* Profile Picture Option Modal */
      , React.createElement(AnimatePresence, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2802 } }
        , showPhotoPopup && !showCamera && (
          React.createElement('div', {
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            },
            onClick: closePhotoPopup, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2804 }
          }

            , React.createElement(motion.div, {
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
              transition: { duration: 0.2 },
              onClick: (e) => e.stopPropagation(),
              style: {
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                width: "100%",
                maxWidth: "360px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                textAlign: "center",
              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2817 }
            }

              , React.createElement('h3', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: MAROON,
                  marginBottom: "6px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2833 }
              }
                , "Profile Photo"

              )
              , React.createElement('p', { style: { color: "#6b5c5c", fontSize: "0.82rem", marginBottom: "20px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2844 } }, "Update your candidate profile picture"

              )
              , React.createElement('div', { style: { display: "flex", flexDirection: "column", gap: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2847 } }
                /* Take Photo */
                , React.createElement('button', {
                  onClick: startCamera,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "rgba(114,16,42,0.05)",
                    border: `1.5px solid ${MAROON}`,
                    borderRadius: "10px",
                    padding: "12px",
                    color: MAROON,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  },
                  className: "hover:bg-[rgba(114,16,42,0.1)]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2849 }
                }

                  , React.createElement(Camera, { size: 16, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2868 } }), " Take Photo"
                )

                /* Choose Photo */
                , React.createElement('button', {
                  onClick: () => _optionalChain([picRef, 'access', _49 => _49.current, 'optionalAccess', _50 => _50.click, 'call', _51 => _51()]),
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "#faf8f5",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "12px",
                    color: "#4a4a4a",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  },
                  className: "hover:bg-[#f0f0f0]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2872 }
                }

                  , React.createElement(Upload, { size: 16, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2891 } }), " Choose Photo"
                )

                /* Remove Photo */
                , profilePic && (
                  React.createElement('button', {
                    onClick: () => {
                      setProfilePic(null);
                      setShowPhotoPopup(false);
                    },
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      background: "rgba(220,38,38,0.05)",
                      border: "1.5px solid #ef4444",
                      borderRadius: "10px",
                      padding: "12px",
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    },
                    className: "hover:bg-[rgba(220,38,38,0.1)]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2896 }
                  }

                    , React.createElement(Trash2, { size: 16, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2918 } }), " Remove Photo"
                  )
                )

                /* Cancel */
                , React.createElement('button', {
                  onClick: closePhotoPopup,
                  style: {
                    background: "transparent",
                    border: "none",
                    color: "#6b5c5c",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    padding: "10px",
                    marginTop: "6px",
                    cursor: "pointer",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2923 }
                }
                  , "Cancel"

                )
              )
            )
          )
        )
      )

      /* Camera Modal */
      , React.createElement(AnimatePresence, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2945 } }
        , showCamera && (
          React.createElement('div', {
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            },
            onClick: stopCamera, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2947 }
          }

            , React.createElement(motion.div, {
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
              transition: { duration: 0.2 },
              onClick: (e) => e.stopPropagation(),
              style: {
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                width: "100%",
                maxWidth: "380px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                textAlign: "center",
              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2960 }
            }

              , React.createElement('h3', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: MAROON,
                  marginBottom: "16px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2976 }
              }

                , cameraTargetDocKey ? "Scan Document" : "Take Photo"
              )

              /* Video wrapper preview */
              , React.createElement('div', {
                style: {
                  width: cameraTargetDocKey ? "280px" : "180px",
                  height: cameraTargetDocKey ? "190px" : "180px",
                  borderRadius: cameraTargetDocKey ? "8px" : "50%",
                  overflow: "hidden",
                  margin: "0 auto 20px",
                  border: `3px solid ${MAROON}`,
                  background: "#000",
                  position: "relative",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2989 }
              }

                , React.createElement('video', {
                  ref: videoRef,
                  autoPlay: true,
                  playsInline: true,
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3001 }
                }
                )
              )

              , React.createElement('div', { style: { display: "flex", flexDirection: "column", gap: "10px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3013 } }
                , React.createElement('button', {
                  onClick: capturePhoto,
                  style: {
                    background: MAROON,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3014 }
                }

                  , React.createElement(Camera, { size: 16, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3031 } }), " Capture ", cameraTargetDocKey ? "Document" : "Photo"
                )

                , React.createElement('button', {
                  onClick: stopCamera,
                  style: {
                    background: "#faf8f5",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "12px",
                    color: "#4a4a4a",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3034 }
                }
                  , "Cancel"

                )
              )
            )
          )
        )
        , pendingNavigation && (
          React.createElement('div', {
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            },
            onClick: () => setPendingNavigation(null), __self: this, __source: { fileName: _jsxFileName, lineNumber: 3054 }
          }

            , React.createElement(motion.div, {
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
              transition: { duration: 0.2 },
              onClick: (e) => e.stopPropagation(),
              style: {
                background: "#fff",
                borderRadius: "16px",
                padding: "28px 24px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                textAlign: "center",
              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3067 }
            }

              , React.createElement('div', {
                style: {
                  background: "rgba(114,16,42,0.08)",
                  borderRadius: "50%",
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3083 }
              }

                , React.createElement(AlertCircle, { size: 28, color: MAROON, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3095 } })
              )
              , React.createElement('h3', {
                style: {
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: MAROON,
                  marginBottom: "8px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3097 }
              }
                , "Unsaved Changes"

              )
              , React.createElement('p', {
                style: {
                  color: "#6b5c5c",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  marginBottom: "24px",
                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3108 }
              }
                , "Are you sure you do not want to save the changes? If you proceed, your new resume upload will be lost."

              )

              , React.createElement('div', { style: { display: "flex", gap: "12px" }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 3119 } }
                , React.createElement('button', {
                  onClick: () => {
                    const action = pendingNavigation;
                    setPendingNavigation(null);
                    revertUnsavedChanges();
                    if (action.type === "tab" && action.targetId) {
                      setActiveTab(action.targetId);
                      setSidebarOpen(false);
                    } else if (action.type === "close") {
                      onClose(action.bypassApplyModal);
                    } else if (action.type === "logout") {
                      _optionalChain([onLogout, 'optionalCall', _52 => _52()]);
                    }
                  },
                  style: {
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
                  },
                  className: "hover:opacity-90", __self: this, __source: { fileName: _jsxFileName, lineNumber: 3120 }
                }
                  , "Discard Changes"

                )
                , React.createElement('button', {
                  onClick: () => {
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
                        _optionalChain([onLogout, 'optionalCall', _52 => _52()]);
                      }
                    }
                  },
                  style: {
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
                  },
                  className: "hover:bg-gray-50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 3150 }
                }
                  , "Save Changes"

                )
              )
            )
          )
        )
      )
    )
  );
}