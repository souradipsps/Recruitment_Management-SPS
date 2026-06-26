import React from "react";
import { CheckCircle, XCircle, Eye, Upload, Trash2, Camera, Clock } from "lucide-react";
import { MAROON } from "../../../data/dashboardMockData";

const verifConfig = {
  verified: {
    label: "Verified",
    color: "#065f46",
    bg: "#f0fdf4",
    border: "#6ee7b7",
    icon: <CheckCircle size={11} />,
  },
  pending: {
    label: "Under Review",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    icon: <Clock size={11} />,
  },
  rejected: {
    label: "Rejected",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fca5a5",
    icon: <XCircle size={11} />,
  },
};

/**
 * A single document upload row (upload / view / camera / remove + verification badge).
 * `children` is rendered between the row controls and the verification badge — used for
 * the inline Aadhaar / PAN / Bank detail fields tied to specific document keys.
 */
export function DocumentRow({
  docKey,
  label,
  accept,
  note,
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
  docsSubmitted,
  startDocCamera,
  children,
}) {
  const uploaded = docs[docKey];
  const verif = docsSubmitted && uploaded ? docStatus[docKey] || "pending" : null;

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a0a0a" }}>{label}</div>
          <div style={{ color: "#9a8a8a", fontSize: "0.72rem", marginTop: "2px" }}>
            {uploaded ? uploaded : note}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {uploaded ? (
            <>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #6ee7b7",
                  color: "#065f46",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                <CheckCircle size={12} /> Uploaded
              </div>
              <button
                onClick={() => {
                  const url = docUrls[docKey];
                  if (url) {
                    window.open(url, "_blank");
                  }
                }}
                style={{
                  background: "#fff",
                  border: `1.5px solid #e5e7eb`,
                  color: "#4a4a4a",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
                className="hover:bg-[#f0f0f0]"
              >
                <Eye size={12} /> View
              </button>
              {!docsSubmitted && (
                <button
                  onClick={() => {
                    setDocs((prev) => {
                      const copy = { ...prev };
                      delete copy[docKey];
                      return copy;
                    });
                    setDocUrls((prev) => {
                      const copy = { ...prev };
                      delete copy[docKey];
                      return copy;
                    });
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                  title="Remove document"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          ) : !docsSubmitted ? (
            <>
              <label style={{ cursor: "pointer" }}>
                <div
                  style={{
                    background: `rgba(114,16,42,0.07)`,
                    border: `1px solid ${MAROON}`,
                    color: MAROON,
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Upload size={12} /> Upload File
                </div>
                <input
                  type="file"
                  accept={accept}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = URL.createObjectURL(f);
                      setDocs((prev) => ({ ...prev, [docKey]: f.name }));
                      setDocUrls((prev) => ({ ...prev, [docKey]: url }));
                    }
                  }}
                />
              </label>
              <button
                onClick={() => startDocCamera(docKey)}
                style={{
                  background: "#faf8f5",
                  border: "1.5px solid #e5e7eb",
                  color: "#4a4a4a",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
                className="hover:bg-[#f0f0f0]"
              >
                <Camera size={12} /> Take Photo
              </button>
            </>
          ) : (
            <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 600 }}>
              Missing document
            </span>
          )}
        </div>
      </div>

      {children}

      {verif && (
        <div
          style={{
            marginTop: "10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: verifConfig[verif].bg,
            border: `1px solid ${verifConfig[verif].border}`,
            color: verifConfig[verif].color,
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: "999px",
          }}
        >
          {verifConfig[verif].icon} {verifConfig[verif].label}
        </div>
      )}
    </div>
  );
}
