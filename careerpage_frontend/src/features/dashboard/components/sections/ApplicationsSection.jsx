import React from "react";
import { motion } from "motion/react";
import { Briefcase, MapPin, Calendar, Eye } from "lucide-react";
import { MAROON, statusConfig } from "../../data/dashboardMockData";

export function ApplicationsSection({
  dynamicApplications,
  allJobs,
  setSelectedJobDesc,
}) {
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
        My Applications
      </h1>
      <p
        style={{
          color: "#6b5c5c",
          fontSize: "0.85rem",
          marginBottom: "20px",
        }}
      >
        Track the status of all your submitted applications.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {dynamicApplications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#9a8a8a", fontSize: "0.875rem" }}>
            <Briefcase size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>No applications yet</div>
            <div style={{ marginTop: "4px", fontSize: "0.8rem" }}>
              Apply for jobs on the careers page to see them here.
            </div>
          </div>
        ) : (
          dynamicApplications.map((job) => {
            const s = statusConfig[job.status] || {
              color: "#555",
              bg: "#f5f5f5",
              icon: null,
            };
            return (
              <div
                key={job.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#1a0a0a",
                        marginBottom: "4px",
                      }}
                    >
                      {job.title}
                    </div>
                    <div
                      style={{
                        color: "#6b5c5c",
                        fontSize: "0.78rem",
                        marginBottom: "10px",
                      }}
                    >
                      {job.department}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#4a4a4a",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Briefcase size={12} color={MAROON} />
                        {job.type}
                      </span>
                      <span
                        style={{
                          color: "#4a4a4a",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <MapPin size={12} color={MAROON} />
                        {job.location}
                      </span>
                      <span
                        style={{
                          color: "#4a4a4a",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Calendar size={12} color={MAROON} />
                        Applied: {job.appliedDate}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
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
                    }}
                  >
                    {s.icon}
                    {job.status}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => {
                      const fullJob = allJobs.find((j) => j.id === job.id);
                      if (fullJob) setSelectedJobDesc(fullJob);
                    }}
                    style={{
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
                    }}
                  >
                    <Eye size={12} /> View Job Description
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
