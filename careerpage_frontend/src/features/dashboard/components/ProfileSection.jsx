import React, { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, FileText, Eye, Download, Upload } from "lucide-react";
import {
  MAROON,
  ALL_SKILLS,
  capitalizeWords,
} from "../data/dashboardMockData";

function SkillsMultiSelect({ selected, onChange, placeholder = "Select or add items…" }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const toggle = (opt) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustom("");
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          minHeight: "42px",
          padding: "8px 32px 8px 12px",
          border: "1.5px solid #e5e7eb",
          borderRadius: "8px",
          background: "#faf8f5",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          position: "relative",
        }}
      >
        {selected.length === 0 && (
          <span style={{ color: "#9ca3af", fontSize: "0.85rem", alignSelf: "center" }}>
            {placeholder}
          </span>
        )}
        {selected.map((s) => (
          <span
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              toggle(s);
            }}
            style={{
              background: `rgba(114,16,42,0.1)`,
              color: MAROON,
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "999px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {s} &times;
          </span>
        ))}
        <span
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: "transform 0.2s",
            color: "#6b5c5c",
            fontSize: "0.75rem",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            zIndex: 100,
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: "6px" }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add custom item…"
              style={{
                flex: 1,
                padding: "6px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              onClick={addCustom}
              style={{
                background: MAROON,
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.78rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Add
            </button>
          </div>
          {ALL_SKILLS.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                padding: "9px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                color: selected.includes(opt) ? MAROON : "#1a0a0a",
                background: selected.includes(opt) ? "rgba(114,16,42,0.05)" : "transparent",
                fontWeight: selected.includes(opt) ? 600 : 400,
              }}
            >
              {opt}
              {selected.includes(opt) && <span style={{ color: MAROON }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileSection({
  profile,
  setProfile,
  resumeFile,
  resumeUrl,
  fileSizeError,
  handleResumeUpload,
  handleViewResume,
  handleSave,
  saved,
  personalSectionRef,
  professionalSectionRef,
  resumeSectionRef,
}) {
  const fileInputRef = React.useRef(null);

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
        My Profile & Resume
      </h1>
      <p
        style={{
          color: "#6b5c5c",
          fontSize: "0.85rem",
          marginBottom: "20px",
        }}
      >
        Keep your profile updated to improve your chances.
      </p>

      {/* Card 1 — Personal Information */}
      <div
        ref={personalSectionRef}
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

      {/* Card 2 — Professional Information */}
      <div
        ref={professionalSectionRef}
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
          Professional Information
        </h2>
        <div style={{ gap: "14px" }} className="grid grid-cols-1 sm:grid-cols-2">
          {/* Educational Qualification */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Educational Qualification <span style={{ color: MAROON }}>*</span>
            </label>
            <select
              value={profile.highestEducation}
              onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background: "#faf8f5",
                color: "#1a0a0a",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select education</option>
              <option>High School / 12th</option>
              <option>Diploma</option>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>M.Phil</option>
              <option>PhD / Doctorate</option>
              <option>B.Ed / M.Ed</option>
            </select>
          </div>

          {/* Degree Name */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Degree Name
            </label>
            <input
              value={profile.degreeName}
              onChange={(e) => setProfile({ ...profile, degreeName: e.target.value })}
              placeholder="e.g. M.Sc Mathematics"
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

          {/* Professional Qualification */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Professional Qualification <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
            </label>
            <select
              value={profile.professionalQualification}
              onChange={(e) => setProfile({ ...profile, professionalQualification: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background: "#faf8f5",
                color: "#1a0a0a",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select qualification</option>
              <option>B.Ed (Bachelor of Education)</option>
              <option>M.Ed (Master of Education)</option>
              <option>CTET / STET Certified</option>
              <option>NET / SET Qualified</option>
              <option>NTT (Nursery Teacher Training)</option>
              <option>D.El.Ed (Diploma in Elementary Education)</option>
              <option>PG Diploma in Education</option>
              <option>Other</option>
            </select>
          </div>

          {/* Other Professional Qualification Text */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Detail (if 'Other')
            </label>
            <input
              value={profile.professionalQualificationOther}
              onChange={(e) => setProfile({ ...profile, professionalQualificationOther: e.target.value })}
              placeholder="e.g. B.Ed, CTET, NET"
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

          {/* Years of Experience */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Years of Experience
            </label>
            <select
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background: "#faf8f5",
                color: "#1a0a0a",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select experience</option>
              <option>0–1 years (Fresher)</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5–8 years</option>
              <option>8+ years</option>
            </select>
          </div>

          {/* Extracurricular Qualification */}
          <div className="sm:col-start-1">
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Extracurricular Qualification <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
            </label>
            <select
              value={profile.extracurricular}
              onChange={(e) => setProfile({ ...profile, extracurricular: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background: "#faf8f5",
                color: "#1a0a0a",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select qualification</option>
              <option>Sports Coaching</option>
              <option>Music / Performing Arts</option>
              <option>Drama / Theatre</option>
              <option>Visual Arts / Craft</option>
              <option>Debate / Public Speaking</option>
              <option>Yoga / Physical Education</option>
              <option>Scouting / NCC</option>
              <option>Community Service / Social Work</option>
              <option>STEM / Robotics Club</option>
              <option>Environmental Activities</option>
              <option>Other</option>
            </select>
          </div>

          {/* Other Extracurricular Detail */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Detail (if 'Other')
            </label>
            <input
              value={profile.extracurricularOther}
              onChange={(e) => setProfile({ ...profile, extracurricularOther: e.target.value })}
              placeholder="e.g. Sports Coach, Music Diploma"
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

        {/* Roles Interested In */}
        <div style={{ marginTop: "14px" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Roles Interested In
          </label>
          <SkillsMultiSelect
            selected={profile.roles}
            onChange={(v) => setProfile({ ...profile, roles: v })}
            placeholder="Select or add roles interested in…"
          />
        </div>

        {/* Skills & Strengths */}
        <div style={{ marginTop: "14px" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Skills & Strengths
          </label>
          <SkillsMultiSelect
            selected={profile.skills}
            onChange={(v) => setProfile({ ...profile, skills: v })}
            placeholder="Select or add skills…"
          />
        </div>

        {/* Salary Expectations + LinkedIn + Portfolio */}
        <div style={{ marginTop: "14px", gap: "14px" }} className="grid grid-cols-1 sm:grid-cols-2">
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Salary Expectations (₹ per annum)
            </label>
            <select
              value={profile.salary}
              onChange={(e) => setProfile({ ...profile, salary: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background: "#faf8f5",
                color: "#1a0a0a",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select expected salary</option>
              <option value="200000">₹2,00,000</option>
              <option value="300000">₹3,00,000</option>
              <option value="400000">₹4,00,000</option>
              <option value="500000">₹5,00,000</option>
              <option value="600000">₹6,00,000</option>
              <option value="700000">₹7,00,000</option>
              <option value="800000">₹8,00,000</option>
              <option value="1000000">₹10,00,000</option>
              <option value="1200000">₹12,00,000+</option>
            </select>
          </div>
          <div className="hidden sm:block" />
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              LinkedIn Profile <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
            </label>
            <input
              value={profile.linkedin}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/yourname"
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
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
              Portfolio / GitHub / Other <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
            </label>
            <input
              value={profile.portfolio}
              onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
              placeholder="https://github.com/username"
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

      {/* CV / Resume */}
      <div
        ref={resumeSectionRef}
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

      {/* Save Changes Button */}
      <button
        onClick={handleSave}
        style={{
          background: MAROON,
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.85rem",
          border: "none",
          borderRadius: "8px",
          padding: "10px 28px",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
      >
        {saved ? "Saved \u2713" : "Save Changes"}
      </button>
    </motion.div>
  );
}
