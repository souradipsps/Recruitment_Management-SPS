import React from "react";
import { motion } from "motion/react";
import { GOLD } from "../../data/dashboardMockData";

export function NotificationsSection({ notifications }) {
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
        Notifications
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              background: n.read ? "#fff" : "#fef9f0",
              border: `1px solid ${n.read ? "#e5e7eb" : "#fde68a"}`,
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: n.read ? "#d1d5db" : GOLD,
                flexShrink: 0,
                marginTop: "5px",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.85rem", color: "#1a0a0a", lineHeight: 1.5 }}>
                {n.text}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#9a8a8a", marginTop: "4px" }}>
                {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
