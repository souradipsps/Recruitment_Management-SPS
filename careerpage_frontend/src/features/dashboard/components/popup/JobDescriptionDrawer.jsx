import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { MAROON } from "../../data/dashboardMockData";

export function JobDescriptionDrawer({
  selectedJobDesc,
  appliedJobIds = [],
  applicationsData = {},
  onClose,
}) {
  return (
    <AnimatePresence>
      {selectedJobDesc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              padding: "28px",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
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
              }}
            >
              <X size={18} />
            </button>

            {/* Title & Department */}
            <h2
              style={{
                color: MAROON,
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "6px",
                paddingRight: "24px",
              }}
            >
              {selectedJobDesc.title}
            </h2>
            <div
              style={{
                color: "#6b5c5c",
                fontSize: "0.82rem",
                fontWeight: 500,
                marginBottom: "20px",
              }}
            >
              {selectedJobDesc.department} &bull; {selectedJobDesc.location}
            </div>

            {/* Job Info Pills */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "rgba(114,16,42,0.08)",
                  color: MAROON,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                {selectedJobDesc.type}
              </span>
              <span
                style={{
                  background: "rgba(201,168,76,0.12)",
                  color: "#9a781b",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                Deadline: {selectedJobDesc.deadline}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a0a0a", marginBottom: "6px" }}>
                Job Description
              </h4>
              <p style={{ fontSize: "0.82rem", color: "#4a4a4a", lineHeight: 1.6 }}>
                {selectedJobDesc.description}
              </p>
            </div>

            {/* Qualifications */}
            {selectedJobDesc.qualifications && selectedJobDesc.qualifications.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a0a0a", marginBottom: "8px" }}>
                  Required Qualifications
                </h4>
                <ul style={{ paddingLeft: "16px", margin: 0 }}>
                  {selectedJobDesc.qualifications.map((qual, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: "0.82rem",
                        color: "#4a4a4a",
                        lineHeight: 1.6,
                        marginBottom: "4px",
                        listStyleType: "disc",
                      }}
                    >
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Information Submitted */}
            {appliedJobIds.includes(selectedJobDesc.id) && (
              <div style={{ marginTop: "20px", borderTop: "1.5px solid #e5e7eb", paddingTop: "20px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "12px" }}>
                  Your Additional Information
                </h4>
                {(() => {
                  const appData = applicationsData[selectedJobDesc.id] || {
                    coverLetter: "Interested in the position.",
                    noticePeriod: "Immediate",
                    hasReferral: "No",
                    referralEmpId: "",
                  };
                  return (
                    <div
                      style={{
                        background: "#faf8f5",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }}>
                          Notice Period
                        </span>
                        <div style={{ fontSize: "0.82rem", color: "#1a0a0a", fontWeight: 500, marginTop: "2px" }}>
                          {appData.noticePeriod}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }}>
                          Referral Information
                        </span>
                        <div style={{ fontSize: "0.82rem", color: "#1a0a0a", fontWeight: 500, marginTop: "2px" }}>
                          {appData.hasReferral === "Yes" ? `Yes (Employee ID: ${appData.referralEmpId})` : "No Referral"}
                        </div>
                      </div>
                      {appData.coverLetter && (
                        <div>
                          <span style={{ fontSize: "0.72rem", color: "#6b5c5c", fontWeight: 600, textTransform: "uppercase" }}>
                            Cover Letter / SOP
                          </span>
                          <div style={{ fontSize: "0.82rem", color: "#4a4a4a", marginTop: "2px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                            {appData.coverLetter}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Action Button */}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                style={{
                  background: MAROON,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
