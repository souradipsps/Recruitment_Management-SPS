import React from "react";
import { LogOut } from "lucide-react";
import { MAROON, navItems } from "../data/dashboardMockData";

export function DashboardSidebar({
  profile,
  profilePic,
  activeTab,
  resumeReplaced,
  unreadCount,
  sidebarOpen,
  setSidebarOpen,
  setActiveTab,
  setPendingNavigation,
  setShowPhotoPopup,
  onLogout,
}) {
  const handleTabClick = (id) => {
    if (activeTab === "resume" && resumeReplaced) {
      setPendingNavigation({ type: "tab", targetId: id });
    } else {
      setActiveTab(id);
      setSidebarOpen(false);
    }
  };

  const handleLogoutClick = () => {
    if (activeTab === "resume" && resumeReplaced) {
      setPendingNavigation({ type: "logout" });
    } else {
      if (onLogout) onLogout();
    }
  };

  // Reorder so notifications is last (per the original filter/map pattern)
  const orderedNavItems = [
    ...navItems.filter((n) => n.id !== "notifications"),
    ...navItems.filter((n) => n.id === "notifications"),
  ];

  return (
    <aside
      style={{
        width: "220px",
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
      className={`fixed left-0 top-[56px] bottom-0 z-[999] shadow-lg flex transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:top-0 md:shadow-none md:flex md:translate-x-0`}
    >
      {/* User avatar */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #f0f0f0",
          textAlign: "center",
        }}
      >
        {/* Profile Picture Circle */}
        <div
          onClick={() => setShowPhotoPopup(true)}
          style={{
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
          }}
          className="hover:scale-105 hover:border-[#c9a84c] group"
          title="Update profile picture"
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, ${MAROON}, #4a0a1a)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : "C"}
            </div>
          )}
          {/* Subtle hover overlay */}
          <div
            style={{
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
            }}
            className="group-hover:opacity-100"
          >
            CHANGE
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1a0a0a" }}>
          {profile.name}
        </div>
        <div style={{ color: "#6b5c5c", fontSize: "0.72rem", marginTop: "2px" }}>
          Job Applicant
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        {orderedNavItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: activeTab === id ? `rgba(114,16,42,0.08)` : "transparent",
              color: activeTab === id ? MAROON : "#4a4a4a",
              fontWeight: activeTab === id ? 600 : 400,
              fontSize: "0.82rem",
              marginBottom: "2px",
              transition: "all 0.15s",
              textAlign: "left",
            }}
          >
            <Icon size={16} />
            {label}
            {id === "notifications" && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: MAROON,
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  borderRadius: "999px",
                  padding: "1px 6px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <button
          onClick={handleLogoutClick}
          style={{
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
          }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}
