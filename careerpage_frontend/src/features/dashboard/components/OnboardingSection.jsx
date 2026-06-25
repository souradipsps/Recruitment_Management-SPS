import React from "react";
import { motion } from "motion/react";
import {
  PartyPopper,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Upload,
  Trash2,
  Camera,
  Clock,
  ClipboardCheck,
  User,
} from "lucide-react";
import { MAROON, offerLetter } from "../data/dashboardMockData";

export function OnboardingSection({
  offerAccepted,
  setOfferAccepted,
  offerRejected,
  setOfferRejected,
  showOfferConfirm,
  setShowOfferConfirm,
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
  aadharNumber,
  setAadharNumber,
  panNumber,
  setPanNumber,
  pfNumber,
  setPfNumber,
  esiNumber,
  setEsiNumber,
  bankAccount,
  setBankAccount,
  bankIfsc,
  setBankIfsc,
  bankName,
  setBankName,
  bankHolder,
  setBankHolder,
  docsSubmitted,
  startDocCamera,
  handleSubmitDocs,
}) {
  const renderDoc = ({ key, label, accept, note }) => {
    const uploaded = docs[key];
    const verif = docsSubmitted && uploaded ? docStatus[key] || "pending" : null;

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

    return (
      <div key={key} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
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
                    const url = docUrls[key];
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
                        delete copy[key];
                        return copy;
                      });
                      setDocUrls((prev) => {
                        const copy = { ...prev };
                        delete copy[key];
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
                        setDocs((prev) => ({ ...prev, [key]: f.name }));
                        setDocUrls((prev) => ({ ...prev, [key]: url }));
                      }
                    }}
                  />
                </label>
                <button
                  onClick={() => startDocCamera(key)}
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

        {/* Aadhaar Number input field */}
        {key === "aadhar" && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
              Aadhaar Number <span style={{ color: MAROON }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                value={aadharNumber}
                disabled={docsSubmitted}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/\D/g, "").slice(0, 12);
                  const formatted = rawVal.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setAadharNumber(formatted);
                }}
                placeholder="1234 5678 9012"
                style={{
                  width: "100%",
                  maxWidth: "260px",
                  padding: "8px 12px",
                  border: `1.5px solid ${
                    aadharNumber.replace(/\s/g, "").length === 12 ? "#065f46" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  outline: "none",
                  background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                  color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                  cursor: docsSubmitted ? "not-allowed" : "text",
                }}
              />
              {aadharNumber.replace(/\s/g, "").length === 12 ? (
                <span style={{ color: "#065f46", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={14} /> Valid format (12 digits)
                </span>
              ) : aadharNumber.replace(/\s/g, "").length > 0 ? (
                <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 500 }}>
                  Enter 12 digits ({12 - aadharNumber.replace(/\s/g, "").length} remaining)
                </span>
              ) : (
                <span style={{ color: "#6b5c5c", fontSize: "0.72rem" }}>
                  Format: 12-digit number
                </span>
              )}
            </div>
          </div>
        )}

        {/* PAN Number input field */}
        {key === "pan" && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
              PAN Number <span style={{ color: MAROON }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                value={panNumber}
                disabled={docsSubmitted}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                  setPanNumber(val);
                }}
                placeholder="ABCDE1234F"
                style={{
                  width: "100%",
                  maxWidth: "260px",
                  padding: "8px 12px",
                  border: `1.5px solid ${
                    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? "#065f46" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  outline: "none",
                  background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                  color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                  cursor: docsSubmitted ? "not-allowed" : "text",
                }}
              />
              {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? (
                <span style={{ color: "#065f46", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={14} /> Valid format (ABCDE1234F)
                </span>
              ) : panNumber.length > 0 ? (
                <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 500 }}>
                  Must match alphanumeric format (e.g. ABCDE1234F)
                </span>
              ) : (
                <span style={{ color: "#6b5c5c", fontSize: "0.72rem" }}>
                  Format: 10 characters (e.g. ABCDE1234F)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bank Details input fields */}
        {key === "bank_details" && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "10px" }}>
              Bank Account Details <span style={{ color: MAROON }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div>
                <input
                  type="text"
                  value={bankHolder}
                  disabled={docsSubmitted}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="Account Holder's Name"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none",
                    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={bankAccount}
                  disabled={docsSubmitted}
                  onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Account Number"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none",
                    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={bankIfsc}
                  disabled={docsSubmitted}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="IFSC Code"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none",
                    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={bankName}
                  disabled={docsSubmitted}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank Name"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none",
                    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>
        )}

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
  };

  const uploadedKeys = Object.keys(docs);
  const allRequiredUploaded = docsSubmitted;
  const anyUploadedAndVerified = uploadedKeys.some((k) => docStatus[k] === "verified");

  const steps = [
    { label: "Profile Submitted", done: true, desc: "Your basic profile has been received." },
    { label: "Offer Letter Accepted", done: offerAccepted, desc: "Accept your offer letter to proceed." },
    { label: "Documentation Upload", done: allRequiredUploaded, desc: "Upload all required documents after accepting the offer." },
    { label: "Document Verification", done: anyUploadedAndVerified, desc: "HR will verify your submitted documents." },
    { label: "Background Check", done: false, desc: "HR will initiate a background verification." },
    { label: "Joining Confirmation", done: false, desc: "You will receive a final confirmation email." },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

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
        Onboarding
      </h1>
      <p style={{ color: "#6b5c5c", fontSize: "0.85rem", marginBottom: "20px" }}>
        Submit required documents and complete your onboarding process.
      </p>

      {/* Offer Letter */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <PartyPopper size={16} color={MAROON} />
          <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>Offer Letter</h2>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Status Banners */}
          {offerAccepted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f0fdf4",
                border: "1px solid #6ee7b7",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "16px",
              }}
            >
              <CheckCircle size={20} color="#065f46" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#065f46" }}>
                  Offer Accepted!
                </div>
                <div style={{ color: "#374151", fontSize: "0.78rem", marginTop: "2px" }}>
                  Welcome to South Point School. Joining date: <strong>{offerLetter.joiningDate}</strong>
                </div>
              </div>
            </div>
          )}

          {offerRejected && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#fff5f5",
                border: "1px solid #fca5a5",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "16px",
              }}
            >
              <XCircle size={20} color="#991b1b" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#991b1b" }}>
                  Offer Declined
                </div>
                <div style={{ color: "#374151", fontSize: "0.78rem", marginTop: "2px" }}>
                  You have declined the offer. Contact HR if this was a mistake.
                </div>
              </div>
            </div>
          )}

          {/* Offer Details Grid */}
          <div
            style={{
              background: "#fef9f0",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#1a0a0a", marginBottom: "10px" }}>
              Offer Details
            </div>
            <div style={{ gap: "10px" }} className="grid grid-cols-1 sm:grid-cols-2">
              {[
                { label: "Position", value: offerLetter.role },
                { label: "Department", value: offerLetter.department },
                { label: "Joining Date", value: offerLetter.joiningDate },
                { label: "Offered CTC", value: offerLetter.salary },
                { label: "Issued On", value: offerLetter.issuedDate },
                { label: "Offer Expires", value: offerLetter.expiryDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div
                    style={{
                      color: "#6b5c5c",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      color: label === "Offer Expires" ? "#b45309" : "#1a0a0a",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              style={{
                border: `1px solid ${MAROON}`,
                color: MAROON,
                background: "#fff",
                borderRadius: "8px",
                padding: "9px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
              onClick={() => window.open("#", "_blank")}
            >
              <Eye size={14} /> View Letter
            </button>

            {!offerRejected && (
              <button
                style={{
                  border: `1px solid ${MAROON}`,
                  color: MAROON,
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "9px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
                onClick={() => window.open("#", "_blank")}
              >
                <Download size={14} /> Download PDF
              </button>
            )}

            {!offerAccepted && !offerRejected && (
              <>
                <button
                  onClick={() => setShowOfferConfirm("accept")}
                  style={{
                    background: "#065f46",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle size={14} /> Accept Offer
                </button>
                <button
                  onClick={() => setShowOfferConfirm("reject")}
                  style={{
                    background: "#fff",
                    border: "1px solid #fca5a5",
                    color: "#991b1b",
                    borderRadius: "8px",
                    padding: "9px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    marginLeft: "auto",
                  }}
                >
                  <XCircle size={14} /> Decline Offer
                </button>
              </>
            )}
          </div>

          {/* Accept / Decline Confirm Boxes */}
          {showOfferConfirm === "accept" && (
            <div style={{ marginTop: "14px", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#065f46", marginBottom: "10px" }}>
                Confirm acceptance of the offer for <strong>{offerLetter.role}</strong>?
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setOfferAccepted(true);
                    setShowOfferConfirm(null);
                  }}
                  style={{
                    background: "#065f46",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 20px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                  }}
                >
                  Yes, Accept
                </button>
                <button
                  onClick={() => setShowOfferConfirm(null)}
                  style={{
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    color: "#4a4a4a",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showOfferConfirm === "reject" && (
            <div style={{ marginTop: "14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#991b1b", marginBottom: "10px" }}>
                Are you sure you want to decline the offer for <strong>{offerLetter.role}</strong>? This cannot be undone.
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setOfferRejected(true);
                    setShowOfferConfirm(null);
                  }}
                  style={{
                    background: "#991b1b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 20px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                  }}
                >
                  Yes, Decline
                </button>
                <button
                  onClick={() => setShowOfferConfirm(null)}
                  style={{
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    color: "#4a4a4a",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Required Documents Checklist - visible after acceptance */}
      {offerAccepted && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Upload size={16} color={MAROON} />
            <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>Required Documents</h2>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "8px" }}>
              Compulsory Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {[
                { key: "aadhar", label: "Aadhaar Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Front & back scan — PDF or image" },
                { key: "pan", label: "PAN Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Required for salary processing" },
                { key: "bank_details", label: "Bank Details *", accept: ".pdf,.jpg,.jpeg,.png", note: "Passbook or cancelled cheque" },
                { key: "photo", label: "Passport Size Photo *", accept: ".jpg,.jpeg,.png", note: "White background, recent photo" },
              ].map(renderDoc)}
            </div>

            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "8px" }}>
              Optional Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
                    PF Number
                  </label>
                  <input
                    type="text"
                    value={pfNumber}
                    disabled={docsSubmitted}
                    onChange={(e) => setPfNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter PF Number"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      outline: "none",
                      background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                      color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
                    ESI Number
                  </label>
                  <input
                    type="text"
                    value={esiNumber}
                    disabled={docsSubmitted}
                    onChange={(e) => setEsiNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter ESI Number"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      outline: "none",
                      background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                      color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                    }}
                  />
                </div>
              </div>
              {[
                { key: "driving_license", label: "Driving License", accept: ".pdf,.jpg,.jpeg,.png", note: "Valid driving license (Optional)" },
                { key: "class10", label: "Class 10 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
                { key: "class12", label: "Class 12 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
                { key: "degree", label: "Degree / Graduation Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Final degree or provisional certificate (Optional)" },
                { key: "experience_cert", label: "Experience Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "From previous employer (Optional)" },
                { key: "prof_cert", label: "Professional Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Any relevant professional certificate (Optional)" },
              ].map(renderDoc)}
            </div>

            {/* Document Submit Bottom Status / Action */}
            {docsSubmitted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#fef9f0",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "14px",
                  marginTop: "8px",
                }}
              >
                <Clock size={20} color="#b45309" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#b45309" }}>
                    Documents Under Review
                  </div>
                  <div style={{ color: "#374151", fontSize: "0.78rem", marginTop: "2px" }}>
                    Your documents have been submitted and are currently under review by HR.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  onClick={handleSubmitDocs}
                  style={{
                    background: MAROON,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  className="hover:opacity-90"
                >
                  Submit Documents
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onboarding Steps Visualizer */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ClipboardCheck size={16} color={MAROON} />
          <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>Onboarding Progress</h2>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a" }}>Overall Progress</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: MAROON }}>{pct}%</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
              <div
                style={{
                  background: MAROON,
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: "999px",
                  transition: "width 0.4s",
                }}
              />
            </div>
          </div>

          {steps.map(({ label, done, desc }, idx) => (
            <div
              key={label}
              style={{
                display: "flex",
                gap: "12px",
                padding: "10px 0",
                borderBottom: idx < steps.length - 1 ? "1px solid #f9f9f9" : "none",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: `2px solid ${done ? "#065f46" : "#d1d5db"}`,
                    background: done ? "#065f46" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {done ? (
                    <CheckCircle size={12} color="#fff" />
                  ) : (
                    <span style={{ fontSize: "0.6rem", color: "#9ca3af", fontWeight: 700 }}>
                      {idx + 1}
                    </span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      background: done ? "#065f46" : "#e5e7eb",
                      minHeight: "12px",
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: "8px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: done ? "#065f46" : "#1a0a0a" }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9a8a8a", marginTop: "2px" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
