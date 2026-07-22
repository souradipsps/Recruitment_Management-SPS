import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Briefcase, IndianRupee, MapPin } from "lucide-react";
import "../css/popup/JobDescriptionDrawer.css";

export function JobDescriptionDrawer({
  selectedJobDesc,
  jobApplications = [],
  onClose,
}) {
  const matchedApplication = selectedJobDesc
    ? jobApplications.find((app) => app.posting === selectedJobDesc.id)
    : null;
  return (
    <AnimatePresence>
      {selectedJobDesc && (
        <div
          className="jd-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="jd-panel"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="jd-close-btn"
            >
              <X size={18} />
            </button>

            {/* Title, Badge & Department */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
              <h2 className="jd-title" style={{ margin: 0 }}>
                {selectedJobDesc.title}
              </h2>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0, marginRight: "20px" }}>
                <span className="jd-pill--type">
                  {selectedJobDesc.type}
                </span>
                {selectedJobDesc.deadline && (
                  <span className="jd-pill--deadline">
                    Deadline: {selectedJobDesc.deadline}
                  </span>
                )}
              </div>
            </div>
            
            <div className="jd-subtitle" style={{ margin: 0, marginTop: "4px", marginBottom: "16px" }}>
              {selectedJobDesc.department}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--jd-border)", marginBottom: "16px" }} />

            {/* Meta Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px", color: "var(--jd-maroon)", fontSize: "0.82rem", fontWeight: 500 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} color="var(--jd-maroon)" />
                {selectedJobDesc.location}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Briefcase size={14} color="var(--jd-maroon)" />
                {selectedJobDesc.experience ?? "2–5 yrs"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IndianRupee size={14} color="var(--jd-maroon)" />
                {selectedJobDesc.salaryRange ?? "30k – 50k"}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "20px" }}>
              <p className="jd-description" style={{ margin: 0 }}>
                {selectedJobDesc.description}
              </p>
            </div>

            {/* Grid for Educational Qualifications & Required Skills */}
            <div className="jd-grid" style={{ marginBottom: "20px" }}>
              <div>
                <h4 className="jd-section-title" style={{ marginBottom: "8px" }}>
                  Educational Qualifications:
                </h4>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedJobDesc.qualifications && selectedJobDesc.qualifications.length > 0 ? (
                    selectedJobDesc.qualifications.map((qual, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "start", gap: "8px", fontSize: "0.82rem", color: "var(--jd-soft)", lineHeight: "1.5" }}>
                        <span style={{ color: "var(--jd-maroon)", fontWeight: "bold" }}>•</span>
                        <span>{qual}</span>
                      </li>
                    ))
                  ) : (
                    <li style={{ fontSize: "0.82rem", color: "var(--jd-soft)" }}>Not specified</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="jd-section-title" style={{ marginBottom: "8px" }}>
                  Required Skills &amp; Strengths:
                </h4>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(selectedJobDesc.skills || ["Strong Communication", "Classroom Management", "Team Collaboration"]).map((skill, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "start", gap: "8px", fontSize: "0.82rem", color: "var(--jd-soft)", lineHeight: "1.5" }}>
                      <span style={{ color: "var(--jd-maroon)", fontWeight: "bold" }}>•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Information Submitted — sourced from the candidate's
                real submitted application (GET /api/applications/), not local
                session state, so it's accurate even right after a fresh login. */}
            {matchedApplication && (
              <div className="jd-additional">
                <h4 className="jd-additional-title">
                  Your Additional Information
                </h4>
                <div className="jd-info-box">
                  <div>
                    <span className="jd-info-label">
                      Notice Period
                    </span>
                    <div className="jd-info-value">
                      {matchedApplication.notice_period || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <span className="jd-info-label">
                      Referral Information
                    </span>
                    <div className="jd-info-value">
                      {matchedApplication.has_referral
                        ? `Yes (Employee ID: ${matchedApplication.referral_emp_id || "Not specified"})`
                        : "No Referral"}
                    </div>
                  </div>
                  {matchedApplication.cover_letter && (
                    <div>
                      <span className="jd-info-label">
                        Cover Letter / SOP
                      </span>
                      <div className="jd-info-value--pre">
                        {matchedApplication.cover_letter}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="jd-footer">
              <button
                onClick={onClose}
                className="jd-btn-close"
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
