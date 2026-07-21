import React, { useState } from "react";
import { motion } from "motion/react";
import { KeyRound, Eye, EyeOff, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "../../../careerpage/services/authService";
import "../css/sections/ProfileSection.css";
import "../css/sections/profile/PersonalInfoCard.css";

export function SecuritySection() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setSuccess("Password updated successfully!");
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password. Please check your current password.");
      toast.error(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ width: "100%" }}
    >
      <h1 className="ps-page-title">
        Account Security
      </h1>
      <p className="ps-page-sub">
        Update your password to keep your candidate account secure.
      </p>

      {/* Main Full-Width Card */}
      <div className="pic-card" style={{ width: "100%", boxSizing: "border-box", padding: "28px" }}>
        {/* Card Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f0f0f0" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "rgba(114, 16, 42, 0.08)",
              color: "#72102a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1a0a0a", fontFamily: "'Playfair Display', serif" }}>
              Change Password
            </h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b5c5c", marginTop: "2px" }}>
              Enter your current password and choose a strong new password to protect your account.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          {/* Left Column: Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {error && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#991b1b",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #6ee7b7",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#065f46",
                  fontWeight: 600,
                }}
              >
                ✓ {success}
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="pic-field-label">Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pic-input"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="pic-field-label">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="pic-input"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="pic-field-label">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="pic-input"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: "6px" }}>
              <button
                type="submit"
                disabled={loading}
                className="ps-save-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 28px" }}
              >
                <KeyRound size={16} />
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          {/* Right Column: Security Guidelines Card */}
          <div
            style={{
              backgroundColor: "#faf8f5",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#72102a", fontWeight: 700, fontSize: "0.95rem" }}>
              <Lock size={18} />
              Password Recommendations
            </div>

            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b5c5c", lineHeight: 1.5 }}>
              For optimal security, ensure your new password meets the following safety criteria:
            </p>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "At least 6 characters long",
                "Contains a mix of uppercase and lowercase letters",
                "Includes at least one number (0-9) or symbol",
                "Avoid using easily guessable information like your name or birthdate",
                "Never share your candidate portal credentials with anyone",
              ].map((tip, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.8rem", color: "#374151" }}>
                  <CheckCircle2 size={16} style={{ color: "#059669", flexShrink: 0, marginTop: "2px" }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
