import React from "react";
import { motion } from "motion/react";
import { ChevronRight, Calendar, MapPin } from "lucide-react";
import { MAROON, statusConfig } from "../data/dashboardMockData";

export function OverviewSection({ profile, dynamicApplications, setActiveTab }) {
  const stats = [
    {
      label: "Total Applied",
      value: dynamicApplications.length,
      color: MAROON,
    },
    {
      label: "Shortlisted",
      value: dynamicApplications.filter((j) => j.status === "Shortlisted").length,
      color: "#065f46",
    },
    {
      label: "Interviews",
      value: dynamicApplications.filter((j) => j.status === "Interview Scheduled").length,
      color: "#1e40af",
    },
    {
      label: "Under Review",
      value: dynamicApplications.filter((j) => j.status === "Under Review").length,
      color: "#b45309",
    },
  ];

  return (
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
          marginBottom: "4px",
        }}
      >
        Welcome back, {profile.name}!
      </h1>
      <p
        style={{
          color: "#6b5c5c",
          fontSize: "0.85rem",
          marginBottom: "20px",
        }}
      >
        Here's an overview of your applications and activity.
      </p>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color,
                fontSize: "1.8rem",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            <div
              style={{
                color: "#6b5c5c",
                fontSize: "0.72rem",
                marginTop: "4px",
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#1a0a0a",
            }}
          >
            Recent Applications
          </h2>
          <button
            onClick={() => setActiveTab("applications")}
            style={{
              color: MAROON,
              fontSize: "0.78rem",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            View All <ChevronRight size={13} />
          </button>
        </div>

        {dynamicApplications.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#6b5c5c" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>No applications yet</div>
            <div style={{ marginTop: "4px", fontSize: "0.8rem" }}>
              Apply for jobs on the careers page to see them here.
            </div>
          </div>
        ) : (
          dynamicApplications.slice(0, 3).map((job) => {
            const s = statusConfig[job.status] || {
              color: "#555",
              bg: "#f5f5f5",
              icon: null,
            };
            return (
              <div
                key={job.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #f9f9f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#1a0a0a",
                    }}
                  >
                    {job.title}
                  </div>
                  <div
                    style={{
                      color: "#6b5c5c",
                      fontSize: "0.75rem",
                      marginTop: "2px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Calendar size={11} />
                      {job.appliedDate}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <MapPin size={11} />
                      {job.location}
                    </span>
                  </div>
                </div>
                <span
                  style={{
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
                  }}
                >
                  {s.icon}
                  {job.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
