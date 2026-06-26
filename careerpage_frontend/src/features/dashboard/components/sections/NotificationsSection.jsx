import React from "react";
import { motion } from "motion/react";
import "../css/sections/NotificationsSection.css";

export function NotificationsSection({ notifications }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="ns-page-title">
        Notifications
      </h1>
      <div className="ns-list">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`ns-item ${n.read ? "ns-item--read" : "ns-item--unread"}`}
          >
            <div className={`ns-dot ${n.read ? "ns-dot--read" : "ns-dot--unread"}`} />
            <div className="ns-content">
              <div className="ns-text">
                {n.text}
              </div>
              <div className="ns-time">
                {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
