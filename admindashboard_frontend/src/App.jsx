import { useState, useEffect } from "react";
import { T, font } from "./theme";
import { useBreakpoint, usePersistentState, useSessionState } from "./hooks";
import { NAV, EXISTING_ROLES, POSTINGS, JOB_APPLICATIONS, GENERAL_APPLICATIONS, INTERVIEWS, OFFERS } from "./data";
import { fetchJobRequests } from "./api/jobRequestsApi";
import { fetchApprovals } from "./api/approvalsApi";
import { fetchRoles } from "./api/rolesApi";

import Auth from "./screens/Auth";
import ModuleSelector from "./screens/ModuleSelector";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ScreenRouter from "./components/ScreenRouter";

const defaultPanelists = () =>
  ["Dr. Roy", "Mr. Patel", "Ms. Nisha", "Mr. Kumar", "Mr. Rajan", "Dr. Ananya"].map((name) => ({
    name,
    email: `${name.toLowerCase().replace(". ", "_").replace(" ", "_")}@school.edu`,
    phone: "9876543210",
  }));

export default function App() {
  const [active, setActive] = useState("applications");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persisted app data (each mirrors itself to localStorage).
  const [roleRequests, setRoleRequests] = usePersistentState("roleRequests", []);
  const [jobRequests, setJobRequests] = usePersistentState("jobRequests", []);
  const [approvalRequests, setApprovalRequests] = usePersistentState("approvalRequests", []);
  const [existingRoles, setExistingRoles] = usePersistentState("existingRoles", () =>
    EXISTING_ROLES.map((r) => ({ ...r, currentStatus: r.status, currentFilled: r.filled })),
  );
  const [jobPostings, setJobPostings] = usePersistentState("jobPostings", () =>
    POSTINGS.map((p) => ({ ...p, status: p.status || "Published" })),
  );
  const [jobApplications, setJobApplications] = usePersistentState("jobApplications", JOB_APPLICATIONS);
  const [generalApplications, setGeneralApplications] = usePersistentState("generalApplications", GENERAL_APPLICATIONS);
  const [offers, setOffers] = usePersistentState("offers", OFFERS);
  const [interviews, setInterviews] = usePersistentState("interviews", INTERVIEWS);
  const [panelists, setPanelists] = usePersistentState("panelists", defaultPanelists);
  const [selectedPanelists] = usePersistentState("selectedPanelists", ["Dr. Roy", "Mr. Patel", "Ms. Nisha"]);

  // Session-scoped auth/module selection.
  const [currentUser, setCurrentUser] = useSessionState("currentUser", null);
  const [selectedModule, setSelectedModule] = useSessionState("selectedModule", null);

  // Load job requests from the API on mount (uses the access token in .env; no login flow yet).
  useEffect(() => {
    let active = true;
    fetchJobRequests()
      .then((data) => { if (active) setJobRequests(data); })
      .catch((err) => console.error("Failed to load job requests:", err));
    return () => { active = false; };
  }, [setJobRequests]);

  // Load approval requests from the API on mount (backend auto-creates these on submission).
  useEffect(() => {
    let active = true;
    fetchApprovals()
      .then((data) => { if (active) setApprovalRequests(data); })
      .catch((err) => console.error("Failed to load approvals:", err));
    return () => { active = false; };
  }, [setApprovalRequests]);

  // Load existing roles from the API on mount.
  useEffect(() => {
    let active = true;
    fetchRoles()
      .then((data) => { if (active) setExistingRoles(data); })
      .catch((err) => console.error("Failed to load roles:", err));
    return () => { active = false; };
  }, [setExistingRoles]);

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
    setCurrentUser(null);
    setSelectedModule(null);
  };

  const handleGiveOffer = (candidate) => {
    const exists = offers.some((o) => o.candidate === candidate.name && o.role === candidate.role);
    if (!exists) {
      setOffers((prev) => [...prev, {
        id: `OFR-${Date.now()}`,
        candidate: candidate.name,
        role: candidate.role,
        ctc: "", issued: "", expiry: "", joining: "",
        status: "Draft",
      }]);
    }
    setActive("offer-management");
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (!selectedModule) {
    return (
      <ModuleSelector
        currentUser={currentUser}
        onSelectModule={(mod) => {
          setSelectedModule(mod);
          setActive(currentUser.role === "admin" ? "dashboard" : "panelist");
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
        pendingCount={pendingCount}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNavPending={() => handleNav("approval-requests")}
        onBackToModules={() => setSelectedModule(null)}
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
