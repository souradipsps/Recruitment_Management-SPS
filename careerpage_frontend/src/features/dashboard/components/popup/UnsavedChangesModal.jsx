import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import { MAROON } from "../../data/dashboardMockData";

export function UnsavedChangesModal({ open, onDismiss, onDiscard, onSave }) {
  return (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px 24px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "rgba(114,16,42,0.08)",
                borderRadius: "50%",
                width: "56px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertCircle size={28} color={MAROON} />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: MAROON,
                marginBottom: "8px",
              }}
            >
              Unsaved Changes
            </h3>
            <p
              style={{
                color: "#6b5c5c",
                fontSize: "0.875rem",
                lineHeight: 1.5,
                marginBottom: "24px",
              }}
            >
              Are you sure you do not want to save the changes? If you proceed, your new resume upload will be lost.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onDiscard}
                style={{
                  flex: 1,
                  background: MAROON,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                className="hover:opacity-90"
              >
                Discard Changes
              </button>
              <button
                onClick={onSave}
                style={{
                  flex: 1,
                  background: "#faf8f5",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#4a4a4a",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                className="hover:bg-gray-50"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
