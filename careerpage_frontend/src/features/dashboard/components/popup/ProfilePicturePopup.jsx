import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MAROON } from "../../data/dashboardMockData";

export function ProfilePicturePopup({
  open,
  picRef,
  onTakePhoto,
  onPhotoUpload,
  onClose,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "320px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: MAROON,
                marginBottom: "16px",
              }}
            >
              Update Profile Picture
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={onTakePhoto}
                style={{
                  background: MAROON,
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Take Photo (Webcam)
              </button>
              <label
                style={{
                  background: "#faf8f5",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#4a4a4a",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "block",
                }}
              >
                Upload File
                <input
                  ref={picRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onPhotoUpload}
                />
              </label>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6b5c5c",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginTop: "6px",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
