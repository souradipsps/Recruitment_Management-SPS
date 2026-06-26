import React from "react";
import { motion } from "motion/react";
import { LogOut } from "lucide-react";
import { MAROON } from "../../data/dashboardMockData";

const SETTINGS_OPTIONS = [
  {
    key: "email",
    label: "Email Notifications",
    desc: "Receive updates about your applications via email",
  },
  {
    key: "sms",
    label: "SMS Alerts",
    desc: "Get text message alerts for interview invitations",
  },
  {
    key: "visibility",
    label: "Profile Visibility",
    desc: "Allow recruiters to find your profile",
  },
];

export function SettingsSection({ settingsNotify, setSettingsNotify, onLogout }) {
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
          marginBottom: "20px",
        }}
      >
        Settings
      </h1>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {SETTINGS_OPTIONS.map(({ key, label, desc }, i) => (
          <div
            key={label}
            style={{
              padding: "16px 20px",
              borderBottom: i < SETTINGS_OPTIONS.length - 1 ? "1px solid #f0f0f0" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1a0a0a" }}>
                {label}
              </div>
              <div style={{ color: "#6b5c5c", fontSize: "0.75rem", marginTop: "2px" }}>
                {desc}
              </div>
            </div>
            <div
              onClick={() =>
                setSettingsNotify((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "999px",
                background: settingsNotify[key] ? MAROON : "#d1d5db",
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: settingsNotify[key] ? "21px" : "3px",
                  top: "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "16px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px 20px",
        }}
      >
        <button
          onClick={onLogout}
          style={{
            color: "#991b1b",
            fontWeight: 600,
            fontSize: "0.85rem",
            background: "none",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "9px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </motion.div>
  );
}
