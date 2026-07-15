import { useState, useEffect } from "react";
import { T, font } from "./theme";
import { useBreakpoint, usePersistentState, useSessionState } from "./hooks";
import { NAV } from "./data";
import { fetchJobRequests } from "./api/jobRequestsApi";
import { fetchApprovals } from "./api/approvalsApi";
import { fetchRoles } from "./api/rolesApi";
import { fetchJobPostings } from "./api/jobPostingsApi";
import { fetchRoleRequests } from "./api/roleRequestsApi";
import { fetchApplications, fetchGeneralApplications } from "./api/applicationsApi";
import { fetchPanelists } from "./api/panelistsApi";
import { fetchInterviews } from "./api/interviewsApi";
import { fetchOffers, createOffer } from "./api/offersApi";
import { logout } from "./api/authApi";
import { isAdmin } from "./authRules";

import Auth from "./screens/Auth";
import ModuleSelector from "./screens/ModuleSelector";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ScreenRouter from "./components/ScreenRouter";

export default function App() {
  const [active, setActive] = useState("applications");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live-API-backed data (no mock seed, no localStorage persistence — each is
  // populated purely by its fetch effect below and mutated via its API client).
  const [roleRequests, setRoleRequests] = useState([]);
  const [jobRequests, setJobRequests] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [existingRoles, setExistingRoles] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [generalApplications, setGeneralApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [panelists, setPanelists] = useState([]);
  const [offers, setOffers] = useState([]);

  // Persisted app data (each mirrors itself to localStorage).
  const [selectedPanelists] = usePersistentState("selectedPanelists", ["Dr. Roy", "Mr. Patel", "Ms. Nisha"]);

  // Session-scoped auth/module selection.
  const [currentUser, setCurrentUser] = useSessionState("currentUser", null);
  const [selectedModule, setSelectedModule] = useSessionState("selectedModule", null);

  // Load all API-backed data once the user is authenticated. Gated on currentUser
  // so the fetches run with a valid token from the login flow (and re-run on login,
  // not before). The token itself is read dynamically per request via authApi.
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const load = (fn, setter, label) =>
      fn()
        .then((data) => { if (active) setter(data); })
        .catch((err) => console.error(`Failed to load ${label}:`, err));

    load(fetchJobRequests, setJobRequests, "job requests");
    load(fetchApprovals, setApprovalRequests, "approvals");
    load(fetchRoles, setExistingRoles, "roles");
    load(fetchJobPostings, setJobPostings, "job postings");
    load(fetchRoleRequests, setRoleRequests, "role requests");
    load(fetchApplications, setJobApplications, "applications");
    load(fetchGeneralApplications, setGeneralApplications, "general applications");
    load(fetchPanelists, setPanelists, "panelists");
    load(fetchInterviews, setInterviews, "interviews");
    load(fetchOffers, setOffers, "offers");

    return () => { active = false; };
  }, [currentUser]);

  // Panelists only ever have one destination (the Panelist screen) — skip the
  // module picker entirely and drop them straight in, instead of making them
  // click through a module list that's otherwise meaningless to them.
  useEffect(() => {
    if (currentUser && !selectedModule && !isAdmin(currentUser)) {
      setSelectedModule("Recruitment");
      setActive("panelist");
    }
  }, [currentUser, selectedModule]);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isCompact = isMobile || isTablet;

  const handleNav = (id) => {
    setActive(id);
    if (isCompact) setSidebarOpen(false);
  };

  const pendingCount = approvalRequests.filter((r) => r.status === "Pending").length;
  const pageLabel = NAV.find((n) => n.id === active)?.label || "";

  const handleLogout = () => {
    logout();          // clear stored access/refresh tokens + cached user
    setCurrentUser(null);
    setSelectedModule(null);
  };

  const [givingOffer, setGivingOffer] = useState(false);
  const handleGiveOffer = async (candidate) => {
    if (givingOffer) return; // guard against rapid double-clicks creating duplicate drafts
    const exists = offers.some((o) => o.candidate === candidate.name && o.role === candidate.role);
    if (!exists) {
      setGivingOffer(true);
      try {
        const created = await createOffer({
          candidate: candidate.name,
          role: candidate.role,
          candidateId: candidate.candidateId,
          ctc: "", issued: "", expiry: "", joining: "",
          status: "Draft",
        });
        setOffers((prev) => [...prev, created]);
      } catch (err) {
        console.error("Failed to create offer:", err);
        alert("Failed to create offer. Please try again.");
        return;
      } finally {
        setGivingOffer(false);
      }
    }
    setActive("offer-management");
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (!selectedModule) {
    // Non-admins are routed straight in by the effect above — nothing to render
    // while that resolves (avoids flashing the module picker first).
    if (!isAdmin(currentUser)) return null;
    return (
      <ModuleSelector
        currentUser={currentUser}
        onSelectModule={(mod) => {
          setSelectedModule(mod);
          setActive("dashboard");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // State bag passed to the screen router (avoids threading ~20 props through App's JSX).
  const screenState = {
    roleRequests, setRoleRequests,
    jobRequests, setJobRequests,
    approvalRequests, setApprovalRequests,
    existingRoles, setExistingRoles,
    jobPostings, setJobPostings,
    jobApplications, setJobApplications,
    generalApplications, setGeneralApplications,
    offers, setOffers,
    interviews, setInterviews,
    panelists, setPanelists,
    selectedPanelists,
    currentUser,
  };

  const sidebarBg = `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.canvas, fontFamily: font.body }}>
      <TopBar
        isMobile={isMobile}
        isCompact={isCompact}
        pageLabel={pageLabel}
        pendingCount={isAdmin(currentUser) ? pendingCount : 0}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNavPending={() => handleNav("approval-requests")}
        onBackToModules={isAdmin(currentUser) ? () => setSelectedModule(null) : undefined}
      />

      {/* Main layout container (Sidebar + Screen Content) */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Desktop sidebar */}
        {!isCompact && (
          <div style={{
            width: 240,
            background: sidebarBg,
            display: "flex", flexDirection: "column", flexShrink: 0,
            boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
          }}>
            <Sidebar
              active={active}
              currentUser={currentUser}
              pendingCount={pendingCount}
              onNav={handleNav}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {isCompact && sidebarOpen && (
          <>
            <div
              className="modal-backdrop"
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}
              onClick={() => setSidebarOpen(false)}
            />
            <div
              className="sidebar-slide-in"
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0, width: 270,
                background: sidebarBg,
                display: "flex", flexDirection: "column", zIndex: 201,
                boxShadow: "8px 0 32px rgba(0,0,0,0.25)",
              }}
            >
              <Sidebar
                active={active}
                currentUser={currentUser}
                pendingCount={pendingCount}
                onNav={handleNav}
                onLogout={handleLogout}
              />
            </div>
          </>
        )}

        {/* Page content */}
        <div
          key={active}
          className="animate-fade-in-up"
          style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px" : "28px 32px" }}
        >
          <ScreenRouter
            active={active}
            s={screenState}
            navigate={setActive}
            onGiveOffer={handleGiveOffer}
          />
        </div>
      </div>
    </div>
  );
}
