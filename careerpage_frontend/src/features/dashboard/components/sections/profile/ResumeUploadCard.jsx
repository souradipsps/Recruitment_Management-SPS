import React from "react";
import { FileText, Eye, Download, Upload } from "lucide-react";
import { MAROON } from "../../../data/dashboardMockData";

export function ResumeUploadCard({
  resumeFile,
  resumeUrl,
  fileSizeError,
  handleResumeUpload,
  handleViewResume,
  sectionRef,
}) {
  const fileInputRef = React.useRef(null);

  return (
    <div
      ref={sectionRef}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: MAROON, marginBottom: "16px", fontFamily: "'Playfair Display', serif" }}>
        CV / Resume
      </h2>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", marginBottom: "16px", background: "#faf8f5" }}>
        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a0a0a", marginBottom: "6px" }}>
          Current Resume
        </div>
        {resumeFile ? (
          <>
            <div style={{ fontSize: "0.8rem", color: "#6b5c5c", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={13} color={MAROON} /> {resumeFile}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleViewResume}
                style={{
                  border: `1px solid ${MAROON}`,
                  color: MAROON,
                  background: "white",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <Eye size={14} /> View Resume
              </button>
              <a
                href={resumeUrl || "#"}
                download={resumeFile}
                style={{
                  border: `1px solid ${MAROON}`,
                  color: MAROON,
                  background: "white",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                }}
              >
                <Download size={14} /> Download
              </a>
            </div>
          </>
        ) : (
          <div style={{ fontSize: "0.8rem", color: "#9a8a8a", fontStyle: "italic" }}>
            No resume uploaded yet.
          </div>
        )}
      </div>
      <div
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: `2px dashed ${MAROON}`,
          borderRadius: "10px",
          padding: "24px",
          textAlign: "center",
          cursor: "pointer",
          background: "#fdf8f9",
        }}
      >
        <Upload size={28} style={{ color: MAROON, margin: "0 auto 10px" }} />
        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1a0a0a" }}>
          {resumeFile ? "Replace Resume" : "Upload Resume"}
        </div>
        <div style={{ color: "#6b5c5c", fontSize: "0.75rem", marginTop: "4px" }}>
          PDF, DOC or DOCX &bull; Maximum 5 MB
        </div>
        {fileSizeError && <div style={{ color: "#d00", fontSize: "0.75rem", marginTop: "6px" }}>{fileSizeError}</div>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={handleResumeUpload}
        />
      </div>
    </div>
  );
}
