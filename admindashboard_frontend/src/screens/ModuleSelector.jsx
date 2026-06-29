import { useState } from "react";
import { T, font, radius, shadow, transition } from "../theme";

export default function ModuleSelector({ currentUser, onSelectModule, onLogout }) {
  const modules = [
    {
      id: "Recruitment",
      title: "HR & Recruitment",
      icon: "💼",
      desc: "Publish vacancies, evaluate applications, coordinate panel interviews, and manage onboarding for new academic and administrative staff.",
      status: "active",
      badge: "Active Workspace",
    },
    {
      id: "Academics",
      title: "Academics & Curriculum",
      icon: "📚",
      desc: "Configure syllabus frameworks, manage classroom timetables, track progression, and generate student gradebooks.",
      status: "locked",
      badge: "Academics Desk",
    },
    {
      id: "Students",
      title: "Student Information (SIS)",
      icon: "👥",
      desc: "Track student admissions, coordinate classroom allocations, log daily attendance, and manage guardian registries.",
      status: "locked",
      badge: "Registry Desk",
    },
    {
      id: "Finance",
      title: "Financial Operations",
      icon: "💳",
      desc: "Administer student fee collections, process payroll allocations, track receipts, and audit departmental budgets.",
      status: "locked",
      badge: "Finance Desk",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "linear-gradient(rgba(92, 12, 33, 0.94) 0%, rgba(48, 6, 17, 0.97) 100%), url('/school_campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "24px 30px",
        fontFamily: font.body,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* CSS stylesheet for spring-based responsive zooms and animations */}
      <style>{`
        .mis-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .mis-card-active:hover {
          transform: translateY(-8px) scale(1.03) !important;
          border-color: ${T.accent} !important;
          box-shadow: 0 20px 40px rgba(114, 16, 42, 0.25), 0 10px 20px rgba(201, 168, 76, 0.15) !important;
        }
        .mis-card-locked:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
        }
        
        @keyframes float-blob-1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-blob-2 {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(20px) scale(1); }
        }
      `}</style>

      {/* Floating background blur blobs for premium depth */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 380,
          height: 380,
          background: `radial-gradient(circle, ${T.primary} 0%, transparent 70%)`,
          opacity: 0.22,
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "float-blob-1 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 420,
          height: 420,
          background: `radial-gradient(circle, ${T.accent} 0%, transparent 70%)`,
          opacity: 0.14,
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "float-blob-2 18s ease-in-out infinite",
        }}
      />

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100%", width: "100%", flex: 1 }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto 40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/images-removebg-preview.png"
              alt="South Point School Logo"
              style={{ height: 48, width: "auto" }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: T.accent, fontFamily: font.heading }}>South Point School</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Management Information System (MIS) Portal</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{currentUser?.name || "User"}</div>
              <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>{currentUser?.email || "user@school.edu"}</div>
            </div>
            <button
              onClick={onLogout}
              className="btn-hover"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1.5px solid rgba(255, 255, 255, 0.25)",
                borderRadius: radius.md,
                padding: "6px 14px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                fontFamily: font.body,
                transition: "all 0.2s",
              }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {/* Simple and clean header with text updates */}
          <div style={{ textAlign: "center", marginBottom: 36 }} className="animate-fade-in-up">
            <h2
              style={{
                fontSize: 28,
                fontWeight: font.black,
                color: T.accent,
                margin: 0,
                fontFamily: font.heading,
                letterSpacing: "-0.02em",
              }}
            >
              Management Information System
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)", marginTop: 8, maxWidth: 600, lineHeight: 1.5, margin: "8px auto 0" }}>
              Welcome to the South Point School administrative console. Select an authorized department workspace below to manage institutional operations.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              width: "100%",
            }}
          >
            {modules.map((m, idx) => {
              const isActive = m.status === "active";
              return (
                <div
                  key={m.id}
                  onClick={() => isActive && onSelectModule(m.id)}
                  className={`mis-card ${isActive ? "mis-card-active card-hover" : "mis-card-locked"}`}
                  style={{
                    background: isActive ? T.surface : T.primaryPale,
                    borderRadius: 20,
                    border: isActive ? `2px solid ${T.accent}88` : `1.5px solid ${T.border}`,
                    padding: 28,
                    cursor: isActive ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: isActive ? shadow.primary : shadow.sm,
                    minHeight: 220,
                    opacity: isActive ? 1 : 0.75,
                    animation: "fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
                    animationDelay: `${idx * 0.06}s`,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <span style={{ fontSize: 32 }}>{m.icon}</span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          borderRadius: 99,
                          padding: "4px 10px",
                          background: isActive ? T.primaryLight : "rgba(114, 16, 42, 0.05)",
                          color: isActive ? T.primary : T.inkLight,
                          border: isActive ? `1px solid ${T.primary}33` : `1px solid ${T.border}`,
                        }}
                      >
                        {m.badge}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: isActive ? T.ink : T.inkMid,
                        margin: "0 0 8px 0",
                        fontFamily: font.heading,
                      }}
                    >
                      {m.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: isActive ? T.inkLight : T.inkFaint,
                        margin: 0,
                      }}
                    >
                      {m.desc}
                    </p>
                  </div>

                  {isActive && (
                    <div
                      style={{
                        marginTop: 16,
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.25s ease",
                      }}
                    >
                      <span>Enter Module ➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
