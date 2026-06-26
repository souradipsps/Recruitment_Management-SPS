import React from "react";
import { motion } from "motion/react";
import { Video, Calendar, User, Link as LinkIcon } from "lucide-react";
import { MAROON, interviews } from "../../data/dashboardMockData";

export function InterviewsSection() {
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
        Upcoming Interviews
      </h1>
      <p style={{ color: "#6b5c5c", fontSize: "0.85rem", marginBottom: "20px" }}>
        Your scheduled interviews and meeting links.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {interviews.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              color: "#9a8a8a",
            }}
          >
            <Video size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>No interviews scheduled yet.</div>
          </div>
        ) : (
          interviews.map((iv) => (
            <div
              key={iv.id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1a0a0a",
                      marginBottom: "6px",
                    }}
                  >
                    {iv.role}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <span
                      style={{
                        color: "#4a4a4a",
                        fontSize: "0.78rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={12} color={MAROON} />
                      {iv.date} at {iv.time}
                    </span>
                    <span
                      style={{
                        color: "#4a4a4a",
                        fontSize: "0.78rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <User size={12} color={MAROON} />
                      {iv.interviewer}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                    <span
                      style={{
                        background: iv.mode === "Online" ? "#dbeafe" : "#f0fdf4",
                        color: iv.mode === "Online" ? "#1e40af" : "#065f46",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      {iv.mode}
                    </span>
                    {iv.platform && (
                      <span style={{ color: "#6b5c5c", fontSize: "0.75rem" }}>
                        via {iv.platform}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#b45309",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    flexShrink: 0,
                  }}
                >
                  {iv.status}
                </span>
              </div>
              {iv.link && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#eff6ff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <LinkIcon size={14} color="#1e40af" />
                    <span style={{ color: "#1e40af", fontSize: "0.8rem", fontWeight: 600 }}>
                      Meeting Link
                    </span>
                    <span style={{ color: "#6b5c5c", fontSize: "0.75rem" }}>
                      {iv.link}
                    </span>
                  </div>
                  <a
                    href={iv.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#1e40af",
                      color: "#fff",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      padding: "7px 16px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Video size={12} /> Join Interview
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
