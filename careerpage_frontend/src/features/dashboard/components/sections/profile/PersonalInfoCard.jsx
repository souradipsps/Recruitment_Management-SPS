import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { MAROON, capitalizeWords } from "../../../data/dashboardMockData";

export function PersonalInfoCard({ profile, setProfile, sectionRef }) {
  // Email OTP edit flow states
  const [emailEdit, setEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const handleSendOtp = () => {
    if (newEmail) {
      setOtpSent(true);
      setOtpError("");
    }
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.length > 0) {
      setProfile((prev) => ({ ...prev, email: newEmail }));
      setEmailVerified(true);
      setEmailEdit(false);
      setOtpError("");
    } else {
      setOtpError("Please enter the OTP.");
    }
  };

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
      <h2
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: MAROON,
          marginBottom: "16px",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Personal Information
      </h2>
      <div style={{ gap: "14px" }} className="grid grid-cols-1 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            First Name
          </label>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: capitalizeWords(e.target.value) })}
            placeholder="First name"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>
        {/* Last Name */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Last Name
          </label>
          <input
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: capitalizeWords(e.target.value) })}
            placeholder="Last name"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Email with OTP change flow */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Email Address
          </label>
          {!emailEdit ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                value={profile.email}
                readOnly
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  outline: "none",
                  background: "#f3f4f6",
                  color: "#6b5c5c",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => {
                  setEmailEdit(true);
                  setNewEmail("");
                  setOtpSent(false);
                  setEnteredOtp("");
                  setOtpError("");
                  setEmailVerified(false);
                }}
                style={{
                  background: MAROON,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 16px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Change Email
              </button>
            </div>
          ) : emailVerified ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                background: "#f0fdf4",
                border: "1px solid #6ee7b7",
                borderRadius: "8px",
              }}
            >
              <CheckCircle size={16} color="#065f46" />
              <span style={{ fontSize: "0.85rem", color: "#065f46", fontWeight: 600 }}>
                Email updated to {profile.email}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none",
                    background: "#faf8f5",
                    color: "#1a0a0a",
                    boxSizing: "border-box",
                  }}
                />
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    style={{
                      background: MAROON,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "9px 16px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setEnteredOtp("");
                      setOtpError("");
                    }}
                    style={{
                      background: "transparent",
                      color: MAROON,
                      border: `1px solid ${MAROON}`,
                      borderRadius: "8px",
                      padding: "9px 14px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Resend
                  </button>
                )}
              </div>
              {otpSent && (
                <>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#065f46",
                      background: "#f0fdf4",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #6ee7b7",
                    }}
                  >
                    OTP sent to <strong>{newEmail}</strong>. Enter the OTP you received.
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      inputMode="numeric"
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        border: `1.5px solid ${otpError ? "#fca5a5" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        outline: "none",
                        background: "#faf8f5",
                        color: "#1a0a0a",
                        letterSpacing: "0.15em",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      style={{
                        background: "#065f46",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "9px 16px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Verify OTP
                    </button>
                  </div>
                  {otpError && <div style={{ color: "#991b1b", fontSize: "0.75rem" }}>{otpError}</div>}
                </>
              )}
              <button
                onClick={() => {
                  setEmailEdit(false);
                  setOtpSent(false);
                  setEnteredOtp("");
                  setOtpError("");
                }}
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  color: "#6b5c5c",
                  border: "none",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Phone Number
          </label>
          <input
            value={profile.phone}
            inputMode="numeric"
            maxLength={10}
            minLength={10}
            pattern="\d{10}"
            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder="Enter a number"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Location */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Current Location
          </label>
          <input
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="Guwahati, Assam"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>
  );
}
