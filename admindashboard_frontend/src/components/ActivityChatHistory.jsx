import React from "react";
import { T } from "../theme";

// Helper to extract initials from name/role
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function ActivityChatHistory({ history = [], currentUser, justification, requestedBy, mode = "requester" }) {
  if (!history || history.length === 0) {
    return null;
  }

  // Determine request creator's name
  const creatorName = requestedBy || "HR Admin";

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.inkFaint,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 12,
        }}
      >
        Activity History
      </div>
      <div
        style={{
          background: "#FAF9F5", // Light warm cream background matching T.canvas
          border: `1.5px solid ${T.border}`,
          borderRadius: 16,
          padding: "16px 20px",
          maxHeight: 360,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        {history.map((h, i) => {
          const entryBy = h.by || "";

          const isLoggedAdmin =
            currentUser?.role?.toLowerCase() === "admin" ||
            currentUser?.email?.toLowerCase().includes("admin");

          const isSubmissionAct = [
            "submitted",
            "resubmitted",
            "submit",
            "resubmit",
          ].includes(h.act?.toLowerCase());

          const isApprovalAct = [
            "approved",
            "sent back",
            "rejected",
            "returned",
            "send back",
            "reject",
            "approve",
          ].includes(h.act?.toLowerCase());

          // Decide alignment based on mode
          let isYou = false;
          if (mode === "approver") {
            // Approver view: approval actions are "You" (right)
            if (isApprovalAct) isYou = true;
            if (isSubmissionAct) isYou = false;
          } else {
            // Requester view: submission actions are "You" (right)
            if (isSubmissionAct) isYou = true;
            if (isApprovalAct) isYou = false;
          }

          if (entryBy.toLowerCase() === "you") {
            isYou = true;
          }

          // Determine displayName inside bubble
          const displayName = isYou
            ? "You"
            : (entryBy && entryBy.toLowerCase() !== "you" ? entryBy : (isSubmissionAct ? "HR Admin" : "Principal Admin"));

          // Determine initials for avatar
          const initialsName = isYou
            ? (currentUser?.name || currentUser?.role || "You")
            : displayName;
          const initials = getInitials(initialsName);

          // Determine text / comment note
          let message = h.note || "";
          const isSubmission = [
            "submitted",
            "resubmitted",
            "submit",
            "resubmit",
          ].includes(h.act?.toLowerCase());

          if (isSubmission && !message) {
            // Find all submission indices in history
            const subIndices = history
              .map((item, idx) => ({ act: item.act?.toLowerCase(), idx }))
              .filter((item) =>
                ["submitted", "resubmitted", "submit", "resubmit"].includes(
                  item.act
                )
              )
              .map((item) => item.idx);

            const isLastSubmission =
              subIndices.length > 0 && i === subIndices[subIndices.length - 1];

            if (justification && (isLastSubmission || history.length === 1)) {
              message = justification;
            } else {
              message =
                h.act === "Resubmitted"
                  ? "Resubmitted the request."
                  : "Submitted the request.";
            }
          }

          if (!message) {
            message = `${h.act || "Processed"} the request.`;
          }

          // Action bubble colors (bubble styling matching status/action)
          let bubbleBg = "#F9FAFB";
          let bubbleBorder = "#E5E7EB";
          let bubbleText = "#374151";
          let badgeBg = "#E5E7EB";
          let badgeText = "#374151";

          const actionLower = h.act?.toLowerCase() || "";
          if (
            actionLower.includes("submit") ||
            actionLower.includes("approve") ||
            actionLower.includes("accept") ||
            actionLower.includes("active")
          ) {
            bubbleBg = "#ECFDF5"; // Light green
            bubbleBorder = "#A7F3D0";
            bubbleText = "#065F46";
            badgeBg = "#D1FAE5";
            badgeText = "#065F46";
          } else if (
            actionLower.includes("back") ||
            actionLower.includes("return")
          ) {
            bubbleBg = "#FFFDF5"; // Light yellow
            bubbleBorder = "#FDE68A";
            bubbleText = "#9A3412";
            badgeBg = "#FEF3C7";
            badgeText = "#9A3412";
          } else if (actionLower.includes("reject")) {
            bubbleBg = "#FEF2F2"; // Light red
            bubbleBorder = "#FECACA";
            bubbleText = "#991B1B";
            badgeBg = "#FEE2E2";
            badgeText = "#991B1B";
          }

          return (
            <div
              key={i}
              style={{
                display: "flex",
                width: "100%",
                justifyContent: isYou ? "flex-end" : "flex-start",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              {/* Left Avatar (for others) */}
              {!isYou && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: T.skyLight, // Light sky blue
                    color: T.sky, // Dark sky blue text
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    border: `1px solid rgba(3, 105, 161, 0.15)`,
                  }}
                >
                  {initials}
                </div>
              )}

              {/* Chat Bubble */}
              <div
                style={{
                  background: bubbleBg,
                  border: `1px solid ${bubbleBorder}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  maxWidth: "75%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  boxSizing: "border-box",
                }}
              >
                {/* Bubble Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.ink,
                    }}
                  >
                    {displayName}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: badgeBg,
                      color: badgeText,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h.act}
                  </span>
                </div>

                {/* Message Content */}
                <div
                  style={{
                    fontSize: 12.5,
                    color: bubbleText,
                    lineHeight: 1.45,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {message}
                </div>

                {/* Message Date */}
                <div
                  style={{
                    alignSelf: "flex-end",
                    fontSize: 9.5,
                    color: T.inkFaint,
                    marginTop: 2,
                  }}
                >
                  {h.date}
                </div>
              </div>

              {/* Right Avatar (for You) */}
              {isYou && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: T.skyLight, // Light sky blue
                    color: T.sky, // Dark sky blue text
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    border: `1px solid rgba(3, 105, 161, 0.15)`,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
