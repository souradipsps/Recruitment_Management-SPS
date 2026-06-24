import { useState, useMemo, useEffect } from "react";
import { LoginModal } from "./components/LoginModal";
import { ApplyModal } from "./components/ApplyModal";
import { CandidateDashboard } from "./components/CandidateDashboard";
import { motion, AnimatePresence } from "motion/react";
import JobApplicationModal from "./components/JobApplicationModal";
import { Toaster, toast } from "sonner";
import {
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Award,
  Users,
  BookOpen,
  Heart,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Shield,
  Search,
  MessageSquare,
  Send,
} from "lucide-react";
import logoImg from "./assets/logo.png";
import campusImg from "./assets/campus.jpg";

const MAROON = "#72102a";
const GOLD = "#c9a84c";
const CREAM = "#faf8f5";

const CATEGORIES = [
  "All Positions",
  "Academic Positions",
  "Administrative Positions",
  "Operations & Support Positions",
];

const jobs = [
  {
    id: 1,
    title: "Senior Mathematics Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "July 15, 2026",
    description:
      "We are looking for an experienced Mathematics teacher to join our secondary school team. The ideal candidate should be passionate about teaching and have a strong command of the subject.",
    qualifications: [
      "Master's degree in Mathematics or related field",
      "B.Ed or equivalent teaching certification",
      "Experience in CBSE curriculum",
    ],
  },
  {
    id: 2,
    title: "English Language & Literature Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "July 20, 2026",
    description:
      "Teach English literature and language skills to secondary students, foster critical thinking and expressive writing across all levels.",
    qualifications: [
      "Degree in English Literature or Linguistics",
      "B.Ed or equivalent teaching certification",
      "Strong communication and writing skills",
    ],
  },
  {
    id: 3,
    title: "Physics Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "July 18, 2026",
    description:
      "Deliver engaging physics lessons from foundational to advanced levels, guide students through experiments and STEM competitions.",
    qualifications: [
      "M.Sc in Physics or related field",
      "B.Ed or equivalent teaching certification",
      "Experience with lab instruction",
    ],
  },
  {
    id: 4,
    title: "School Counsellor",
    department: "Student Welfare",
    type: "Full-time",
    category: "Administrative Positions",
    location: "Guwahati, Assam",
    deadline: "July 25, 2026",
    description:
      "Support students' emotional and academic well-being, coordinate with parents and teachers to nurture a positive school environment.",
    qualifications: [
      "Degree in Psychology or Counselling",
      "Certification in school counselling",
      "Strong interpersonal and empathy skills",
    ],
  },
  {
    id: 5,
    title: "Computer Science Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "August 1, 2026",
    description:
      "Teach programming, computational thinking, and digital literacy; lead the school's coding clubs and technology initiatives.",
    qualifications: [
      "Degree in Computer Science or IT",
      "B.Ed or equivalent teaching certification",
      "Proficiency in Python, Java, or web technologies",
    ],
  },
  {
    id: 6,
    title: "Physical Education Teacher",
    department: "Sports & Wellness",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "August 5, 2026",
    description:
      "Develop and implement physical education programs, coach school sports teams, and promote overall student wellness.",
    qualifications: [
      "Degree in Physical Education or Sports Science",
      "Coaching certification preferred",
      "Experience with school-level sports programs",
    ],
  },
  {
    id: 7,
    title: "Academic Coordinator",
    department: "Administration",
    type: "Full-time",
    category: "Administrative Positions",
    location: "Guwahati, Assam",
    deadline: "August 10, 2026",
    description:
      "Oversee curriculum planning and coordination across departments, liaise between faculty and school leadership to ensure academic quality.",
    qualifications: [
      "Postgraduate degree in Education",
      "Minimum 5 years teaching or admin experience",
      "Strong organisational and leadership skills",
    ],
  },
  {
    id: 8,
    title: "Office Administrator",
    department: "Administration",
    type: "Full-time",
    category: "Administrative Positions",
    location: "Guwahati, Assam",
    deadline: "August 12, 2026",
    description:
      "Manage day-to-day office operations, maintain school records, coordinate communications between staff, parents, and management.",
    qualifications: [
      "Degree in Business Administration or related",
      "Proficiency in MS Office and school ERP",
      "Strong written and verbal communication",
    ],
  },
];

const benefits = [
  {
    icon: GraduationCap,
    title: "Continuous Learning",
    desc: "Funded professional development, workshops, and advanced degree support to keep you at the forefront of education.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    desc: "Comprehensive medical coverage for you and your family, plus access to our on-campus wellness facilities.",
  },
  {
    icon: Shield,
    title: "Job Security",
    desc: "Stable employment in a respected institution with transparent appraisal processes and long-term career pathways.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    desc: "Work alongside dedicated educators in a supportive environment where ideas are shared and collaboration thrives.",
  },
  {
    icon: TrendingUp,
    title: "Career Advancement",
    desc: "Structured growth paths from teacher to department head, academic coordinator, and leadership roles.",
  },
  {
    icon: Award,
    title: "Recognition & Rewards",
    desc: "Annual awards celebrating outstanding educators, performance bonuses, and public recognition of achievements.",
  },
];

const milestones = [
  {
    year: "1960",
    event:
      "South Point School founded with a vision to redefine educational excellence in Guwahati, Assam.",
  },
  {
    year: "1975",
    event:
      "First batch of students achieves distinction in ICSE board examinations, establishing academic legacy.",
  },
  {
    year: "1990",
    event:
      "Expansion of campus and introduction of modern science laboratories and library infrastructure.",
  },
  {
    year: "2005",
    event:
      "Recognition as one of the top schools in West Bengal for academic and extracurricular excellence.",
  },
  {
    year: "2015",
    event:
      "Launch of digital learning initiatives and integration of technology across all departments.",
  },
  {
    year: "2024",
    event:
      "Over 60 years of shaping generations of scholars, leaders, and innovators across disciplines.",
  },
];

const stats = [
  { value: "94%", label: "Employee Satisfaction" },
  { value: "320+", label: "Staff Members" },
  { value: "9 Years", label: "Avg. Employee Tenure" },
  { value: "64+", label: "Years of Excellence" },
];

export default function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://career-page-ksip.onrender.com", { method: "HEAD", mode: "no-cors" })
        .then(() => console.log("Keep-awake ping sent to Render server"))
        .catch((e) => console.error("Keep-awake ping failed:", e));
    }, 10000);
    return () => clearInterval(interval);
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

  const handleApplyJob = (job) => {
    if (!loggedInUser) {
      openModal("login");
      return;
    }
    setSelectedJob(job);
    setShowJobApplicationModal(true);
  };

  const [loginTab, setLoginTab] = useState("login");
  const openModal = (tab) => {
    setLoginTab(tab);
    setShowLogin(true);
  };
  const [activeJob, setActiveJob] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
  });
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    category: "",
    rating: 0,
    hoverRating: 0,
    message: "",
    submitted: false,
  });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Positions");
  const [showAll, setShowAll] = useState(false);
  const JOBS_VISIBLE = 4;

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesCategory =
        activeCategory === "All Positions" ||
        j.category === activeCategory;
      const matchesSearch =
        search === "" ||
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const visibleJobs = showAll
    ? filteredJobs
    : filteredJobs.slice(0, JOBS_VISIBLE);

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

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: CREAM,
        color: "#1a0a0a",
      }}
      className="min-h-screen"
    >
      {/* Navigation */}
      <nav
        style={{
          background: "rgba(114,16,42,0.85)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
        className="sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={logoImg}
                alt="South Point School Logo"
                className="h-11 w-auto object-contain"
              />
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: GOLD,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  South Point School
                </div>
                <div
                  style={{
                    color: "rgba(250,248,245,0.7)",
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                  }}
                  className="uppercase"
                >
                  Guwahati, Assam
                </div>
              </div>
            </div>
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {loggedInUser ? (
                <>
                  <button
                    onClick={() => {
                      setDashboardInitialTab("dashboard");
                      setShowDashboard(true);
                    }}
                    style={{
                      border: `1.5px solid rgba(250,248,245,0.4)`,
                      color: "#faf8f5",
                      fontWeight: 500,
                      fontSize: "0.78rem",
                      letterSpacing: "0.05em",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setLoggedInUser("");
                    }}
                    style={{
                      background: GOLD,
                      color: "#1a0a0a",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      letterSpacing: "0.05em",
                      border: "none",
                      cursor: "pointer",
                    }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openModal("login")}
                    style={{
                      border: `1.5px solid rgba(250,248,245,0.4)`,
                      color: "#faf8f5",
                      fontWeight: 500,
                      fontSize: "0.78rem",
                      letterSpacing: "0.05em",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setApplyAfterSignup(true);
                      openModal("signup");
                    }}
                    style={{
                      background: GOLD,
                      color: "#1a0a0a",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      letterSpacing: "0.05em",
                      border: "none",
                      cursor: "pointer",
                    }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
            {/* Mobile toggle */}
            <details
              id="mobile-nav-menu"
              className="sm:hidden"
              style={{ position: "relative" }}
            >
              <summary
                style={{
                  listStyle: "none",
                  cursor: "pointer",
                  color: "#faf8f5",
                  padding: "6px 8px",
                  border: "1.5px solid rgba(250,248,245,0.35)",
                  borderRadius: "4px",
                  userSelect: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ display: "block", width: "18px", height: "2px", background: "#faf8f5", borderRadius: "2px" }} />
                <span style={{ display: "block", width: "18px", height: "2px", background: "#faf8f5", borderRadius: "2px" }} />
                <span style={{ display: "block", width: "18px", height: "2px", background: "#faf8f5", borderRadius: "2px" }} />
              </summary>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: MAROON,
                  border: "1.5px solid rgba(250,248,245,0.15)",
                  borderRadius: "4px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minWidth: "130px",
                  zIndex: 50,
                  animation: "slideDown 0.2s ease",
                }}
              >
                {loggedInUser ? (
                  <>
                    <button
                      onClick={() => {
                        setDashboardInitialTab("dashboard");
                        setShowDashboard(true);
                        document.getElementById("mobile-nav-menu")?.removeAttribute("open");
                      }}
                      style={{ border: `1.5px solid rgba(250,248,245,0.4)`, color: "#faf8f5", fontWeight: 500, fontSize: "0.78rem", letterSpacing: "0.05em", background: "transparent", cursor: "pointer" }}
                      className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center w-full"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setLoggedInUser("");
                        document.getElementById("mobile-nav-menu")?.removeAttribute("open");
                      }}
                      style={{ background: GOLD, color: "#1a0a0a", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.05em", border: "none", cursor: "pointer" }}
                      className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center w-full"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openModal("login");
                        document.getElementById("mobile-nav-menu")?.removeAttribute("open");
                      }}
                      style={{ border: `1.5px solid rgba(250,248,245,0.4)`, color: "#faf8f5", fontWeight: 500, fontSize: "0.78rem", letterSpacing: "0.05em", background: "transparent", cursor: "pointer" }}
                      className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center w-full"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setApplyAfterSignup(true);
                        openModal("signup");
                        document.getElementById("mobile-nav-menu")?.removeAttribute("open");
                      }}
                      style={{ background: GOLD, color: "#1a0a0a", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.05em", border: "none", cursor: "pointer" }}
                      className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center w-full"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </details>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>
        <img
          src={campusImg}
          alt="South Point School Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.78) 30%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.15) 100%)`,
          }}
        />
        <div
          className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center"
          style={{ minHeight: "88vh" }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#faf8f5",
                  fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                  lineHeight: 1.15,
                  fontWeight: 700,
                }}
              >
                Build Your Future.
                <br />
                <span style={{ color: GOLD }}>Shape the Next Generation.</span>
              </h1>
              <p
                style={{ color: "rgba(250,248,245,0.78)", fontSize: "1rem", lineHeight: 1.8 }}
                className="mt-5 max-w-lg"
              >
                At South Point School, every role contributes to excellence in education and character building.
                Join a community that inspires, supports, and empowers future generations.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#opportunities"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ background: GOLD, color: "#1a0a0a", fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.06em" }}
                  className="px-7 py-3 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Explore Opportunities
                </a>
                {!loggedInUser && (
                  <button
                    onClick={() => document.getElementById("apply-anyway")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ border: `1.5px solid rgba(250,248,245,0.45)`, color: "#faf8f5", fontWeight: 500, fontSize: "0.875rem", background: "transparent", cursor: "pointer" }}
                    className="px-7 py-3 rounded-sm hover:border-white transition-colors"
                  >
                    Submit Profile
                  </button>
                )}
              </div>
              {/* Trust Indicators */}
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  { icon: Award, text: "60+ Years of Excellence" },
                  { icon: TrendingUp, text: "Career Growth Opportunities" },
                  { icon: Users, text: "Inclusive Community" },
                  { icon: Heart, text: "Meaningful Impact" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon size={14} style={{ color: GOLD, flexShrink: 0 }} />
                    <span style={{ color: "rgba(250,248,245,0.7)", fontSize: "0.78rem" }}>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column — Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col justify-center gap-8"
            >
              {stats.map(({ value, label }) => (
                <div key={label} style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: "20px" }}>
                  <div style={{ color: "#faf8f5", fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
                  <div
                    style={{ color: "rgba(250,248,245,0.6)", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 600 }}
                    className="uppercase mt-1"
                  >
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Current Opportunities */}
      <section id="opportunities" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ color: GOLD, fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 700 }} className="uppercase mb-3">
              Open Positions
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 700 }}>
                Current Opportunities
              </h2>
              <div style={{ background: `rgba(107,26,26,0.07)`, border: `1.5px solid rgba(107,26,26,0.15)`, borderRadius: "999px", padding: "6px 18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: MAROON, fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{filteredJobs.length}</span>
                <span style={{ color: "#6b5c5c", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em" }} className="uppercase">
                  Position{filteredJobs.length !== 1 ? "s" : ""} Available
                </span>
              </div>
            </div>
            <div style={{ width: "60px", height: "3px", background: GOLD }} className="mt-2 mb-8" />
          </motion.div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b5c5c", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search by title or department…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowAll(false); setActiveJob(null); }}
                style={{ border: `1.5px solid rgba(107,26,26,0.2)`, background: "#fff", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", paddingLeft: "42px" }}
                className="py-3 pr-4 rounded-sm outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setShowAll(false); setActiveJob(null); }}
                  style={{
                    border: `1.5px solid ${activeCategory === cat ? MAROON : "rgba(107,26,26,0.18)"}`,
                    background: activeCategory === cat ? MAROON : "#fff",
                    color: activeCategory === cat ? "#faf8f5" : "#4a3a3a",
                    fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                  className="px-4 py-2.5 rounded-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Job listings */}
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleJobs.length > 0 ? (
                visibleJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div
                      id={`job-card-${job.id}`}
                      style={{ border: `1.5px solid rgba(0,0,0,0.1)`, background: "#fff", transition: "all 0.25s", position: "relative", overflow: "hidden", borderRadius: "10px" }}
                      className="flex flex-col h-full hover:shadow-lg"
                    >
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3 }}>
                            {job.title}
                          </h3>
                          <span style={{ background: `rgba(114,16,42,0.1)`, color: MAROON, fontSize: "0.7rem", fontWeight: 600, whiteSpace: "nowrap", borderRadius: "999px", padding: "3px 10px", flexShrink: 0 }}>
                            {job.type}
                          </span>
                        </div>
                        <div style={{ color: "#6b5c5c", fontSize: "0.8rem" }}>{job.department}</div>
                      </div>
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", margin: "0 20px" }} />
                      <div className="px-5 pt-3 pb-3 flex flex-wrap gap-4">
                        <span style={{ color: MAROON, fontSize: "0.78rem" }} className="flex items-center gap-1">
                          <MapPin size={12} />{job.location}
                        </span>
                        <span style={{ color: MAROON, fontSize: "0.78rem" }} className="flex items-center gap-1">
                          <Briefcase size={12} />
                          {({
                            1: "3–5 yrs", 2: "2–5 yrs", 3: "3–6 yrs", 4: "2–4 yrs",
                            5: "1–3 yrs", 6: "2–5 yrs", 7: "5–8 yrs", 8: "2–4 yrs",
                            9: "4–7 yrs", 10: "1–3 yrs",
                          })[job.id] ?? "2–5 yrs"}
                        </span>
                        <span style={{ color: MAROON, fontSize: "0.78rem" }} className="flex items-center gap-1">
                          <Clock size={12} />{job.type}
                        </span>
                      </div>
                      <div className="px-5 pb-3">
                        <p style={{ color: "#4a4a4a", fontSize: "0.82rem", lineHeight: 1.65 }}>{job.description}</p>
                      </div>
                      <div className="px-5 pb-4">
                        <div style={{ color: "#1a0a0a", fontSize: "0.82rem", fontWeight: 700 }} className="mb-2">Key Qualifications:</div>
                        <ul className="flex flex-col gap-1">
                          {job.qualifications.map((q) => (
                            <li key={q} className="flex items-start gap-2">
                              <span style={{ color: MAROON, fontSize: "1rem", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>•</span>
                              <span style={{ color: "#4a4a4a", fontSize: "0.78rem", lineHeight: 1.5 }}>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto px-5 pb-5 flex gap-2">
                        {appliedJobIds.includes(job.id) ? (
                          <div style={{ flex: 1, background: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", padding: "11px", gap: "6px", border: "1px solid #6ee7b7" }}>
                            ✓ Applied
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyJob(job)}
                            style={{ background: MAROON, color: "#fff", fontWeight: 600, fontSize: "0.85rem", display: "block", textAlign: "center", borderRadius: "6px", padding: "11px", letterSpacing: "0.03em", transition: "opacity 0.2s", flex: 1, border: "none", cursor: "pointer" }}
                            className="hover:opacity-90"
                          >
                            Apply Now
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const text = `${job.title} at South Point School, Guwahati — ${job.type} | ${job.department}`;
                            if (navigator.share) {
                              navigator.share({ title: job.title, text, url: window.location.href });
                            } else {
                              navigator.clipboard.writeText(`${text}\n${window.location.href}`);
                              toast.success("Job details copied to clipboard!");
                            }
                          }}
                          style={{ border: `1.5px solid ${MAROON}`, color: MAROON, fontWeight: 600, fontSize: "0.78rem", borderRadius: "6px", padding: "11px 14px", background: "transparent", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}
                          className="hover:opacity-80"
                        >
                          Share
                        </button>
                      </div>
                      {!showAll && i === visibleJobs.length - 1 && filteredJobs.length > JOBS_VISIBLE && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{ position: "absolute", inset: 0, backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", background: "rgba(255,255,255,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", borderRadius: "10px" }}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
                            style={{ background: GOLD, color: "#1a0a0a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", border: "none", borderRadius: "999px", padding: "10px 24px", boxShadow: "0 4px 14px rgba(201,168,76,0.4)", cursor: "pointer" }}
                          >
                            + See More
                          </button>
                          <span style={{ color: "#4a3a3a", fontSize: "0.78rem", fontWeight: 500 }}>More opportunities available</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                  <div style={{ color: "#6b5c5c", fontSize: "0.95rem" }}>
                    No positions found matching your search. Try a different keyword or category.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {filteredJobs.length > JOBS_VISIBLE && (
            <div className="mt-8 text-center">
              {showAll && (
                <button
                  onClick={() => {
                    setShowAll(false);
                    setTimeout(() => document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" }), 10);
                  }}
                  style={{ border: `1.5px solid ${MAROON}`, color: MAROON, fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.08em", background: "transparent", transition: "all 0.2s" }}
                  className="px-10 py-3 rounded-sm uppercase tracking-wider"
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Talent Pool / Apply Anyway */}
      <section
        id="apply-anyway"
        style={{ background: `linear-gradient(135deg, ${CREAM} 0%, #f0e8d8 100%)`, display: loggedInUser ? "none" : undefined }}
        className="py-20 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ border: `1.5px solid rgba(107,26,26,0.15)`, background: "#fff", display: loggedInUser ? "none" : undefined }}
            className="rounded-sm p-10 md:p-14 text-center"
          >
            <div style={{ color: GOLD, fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 700 }} className="uppercase mb-3">
              Talent Pool
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
              Don't See Your Role Listed?
            </h2>
            <div style={{ width: "50px", height: "3px", background: GOLD }} className="mt-4 mb-6 mx-auto" />
            <p style={{ color: "#4a3a3a", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto" }}>
              Submit your profile to our talent pool and be the first to hear when a role matching your expertise opens up at South Point School.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-5 mb-10">
              {[
                { icon: Briefcase, text: "All academic and administrative disciplines" },
                { icon: Mail, text: "Early notification for new openings" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={15} style={{ color: GOLD, flexShrink: 0 }} />
                  <span style={{ color: "#4a3a3a", fontSize: "0.875rem" }}>{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setApplyAfterSignup(true); openModal("signup"); }}
              style={{ background: MAROON, color: "#faf8f5", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.08em", display: "inline-block", border: "none", cursor: "pointer" }}
              className="px-12 py-4 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Submit Profile
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 px-6" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ color: GOLD, fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 700 }} className="uppercase mb-3">
              What We Offer
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 700 }}>
              Why Build Your Career at South Point School?
            </h2>
            <div style={{ width: "60px", height: "3px", background: GOLD }} className="mt-4 mb-12" />
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ border: `1.5px solid rgba(107,26,26,0.1)`, background: CREAM }}
                className="p-7 rounded-sm group hover:shadow-lg transition-all"
              >
                <div style={{ background: `rgba(107,26,26,0.08)`, display: "inline-flex", borderRadius: "4px" }} className="p-3 mb-5">
                  <Icon size={22} style={{ color: MAROON }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.05rem", fontWeight: 600 }} className="mb-3">
                  {title}
                </h3>
                <p style={{ color: "#6b5c5c", fontSize: "0.875rem", lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section style={{ background: "#fff" }} className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div style={{ background: `rgba(24,169,184,0.1)`, borderRadius: "50%", padding: "8px" }}>
                <MessageSquare size={18} style={{ color: MAROON }} />
              </div>
              <span style={{ color: "#1a0a0a", fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: 700 }} className="uppercase">
                We'd love to hear from you
              </span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700 }}>
              Share Your Feedback
            </h2>
            <p style={{ color: "#6b5c5c", fontSize: "0.9rem", marginTop: "8px" }}>
              Help us improve your experience. We value every opinion.
            </p>
          </motion.div>

          {feedback.submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ border: `1.5px solid rgba(107,26,26,0.15)`, borderRadius: "12px", background: CREAM, padding: "48px 32px", textAlign: "center" }}
            >
              <div style={{ background: `rgba(107,26,26,0.08)`, borderRadius: "50%", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Send size={22} style={{ color: MAROON }} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "1.4rem", fontWeight: 700 }}>Thank You!</h3>
              <p style={{ color: "#6b5c5c", fontSize: "0.9rem", marginTop: "8px" }}>Your feedback has been submitted successfully.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ border: `1.5px solid rgba(107,26,26,0.12)`, borderRadius: "12px", background: "#fff", padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                    Full Name <span style={{ color: MAROON }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                    Email Address <span style={{ color: MAROON }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none" }}
                  />
                </div>
              </div>
              <div className="mb-5">
                <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                  Category <span style={{ color: MAROON }}>*</span>
                </label>
                <select
                  value={feedback.category}
                  onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                  style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: feedback.category ? "#1a0a0a" : "#9a8a8a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none", appearance: "auto" }}
                >
                  <option value="">Select a category</option>
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Operations">Operations & Support</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="mb-5">
                <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-2">
                  Overall Rating <span style={{ color: MAROON }}>*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      onMouseEnter={() => setFeedback({ ...feedback, hoverRating: star })}
                      onMouseLeave={() => setFeedback({ ...feedback, hoverRating: 0 })}
                      style={{
                        cursor: "pointer",
                        fill: star <= (feedback.hoverRating || feedback.rating) ? GOLD : "transparent",
                        color: star <= (feedback.hoverRating || feedback.rating) ? GOLD : "#ccc",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                  Your Feedback <span style={{ color: MAROON }}>*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Share your thoughts, suggestions, or experience..."
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none", resize: "none" }}
                />
                <div style={{ color: "#9a8a8a", fontSize: "0.75rem", textAlign: "right", marginTop: "4px" }}>
                  {feedback.message.length} character{feedback.message.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={() => {
                  if (feedback.name && feedback.email && feedback.category && feedback.rating && feedback.message)
                    setFeedback({ ...feedback, submitted: true });
                }}
                style={{ background: MAROON, color: "#fff", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.05em", border: "none", borderRadius: "6px", width: "100%", padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }}
                className="hover:opacity-90"
              >
                <Send size={16} /> Submit Feedback
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#ffffff", borderTop: `1px solid rgba(107,26,26,0.12)` }} className="py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="South Point School" className="h-9 w-auto object-contain" />
            <span style={{ color: "#6b5c5c", fontSize: "0.8rem" }}>South Point School · Guwahati, Assam</span>
          </div>
          <div style={{ fontSize: "0.78rem" }} className="flex flex-wrap gap-6 justify-center">
            {["Privacy Policy", "Terms of Use", "Accessibility", "Contact Us"].map((l) => (
              <a key={l} href="#" style={{ color: "#6b5c5c" }} className="hover:text-maroon transition-colors">{l}</a>
            ))}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6b5c5c" }}>© 2026 South Point School. All rights reserved.</div>
        </div>
      </footer>

      {showLogin && (
        <LoginModal
          onClose={() => { setShowLogin(false); setApplyAfterSignup(false); }}
          initialTab={loginTab}
          onLoginSuccess={(name) => { setLoggedInUser(name); setShowLogin(false); setShowDashboard(false); }}
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
          onClose={() => {
            setShowDashboard(false);
            if (cameFromApply) {
              setShowJobApplicationModal(true);
              setCameFromApply(false);
            } else {
              setCameFromSection(undefined);
            }
          }}
          onLogout={() => { setLoggedInUser(""); setShowDashboard(false); setCameFromApply(false); setCameFromSection(undefined); }}
          userName={loggedInUser}
          signupData={signupData}
          appliedJobIds={appliedJobIds}
          allJobs={jobs}
          initialProfileData={mergedProfileData}
          initialTab={dashboardInitialTab}
          initialSection={cameFromSection}
          onProfileUpdate={(updatedData) => { setSavedProfileData(updatedData); setApplicationDraft(null); }}
          applicationsData={applicationsData}
        />
      )}

      {showJobApplicationModal && (
        <JobApplicationModal
          job={selectedJob ? { id: selectedJob.id, title: selectedJob.title, department: selectedJob.department, location: selectedJob.location, type: selectedJob.type } : null}
          onClose={() => { setShowJobApplicationModal(false); setApplicationDraft(null); setCameFromSection(undefined); }}
          onSubmit={(jobId, formData, professionalData) => {
            setAppliedJobIds((prev) => [...prev, jobId]);
            setApplicationsData((prev) => ({ ...prev, [jobId]: formData }));
            setApplicationDraft(null);
            setCameFromSection(undefined);
            if (professionalData) {
              setSavedProfileData((prev) => ({
                ...(prev || {
                  fullName: signupData ? `${signupData.name} ${signupData.lastName || ""}`.trim() : loggedInUser,
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
            firstName: savedProfileData?.fullName?.split(" ")[0] || signupData?.name || loggedInUser,
            lastName: savedProfileData?.fullName?.split(" ").slice(1).join(" ") || signupData?.lastName || "",
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
          onSubmitData={(data) => { setSavedProfileData(data); setShowApply(false); }}
        />
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
}
