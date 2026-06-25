import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera } from "lucide-react";
import { MAROON } from "../data/dashboardMockData";

export function CameraModal({ isOpen, cameraTargetDocKey, onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraTargetDocKey]);

  const startCamera = async () => {
    try {
      const constraints = cameraTargetDocKey
        ? { video: { width: 640, height: 480, facingMode: "environment" } }
        : { video: { width: 300, height: 300, facingMode: "user" } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      // Suppress alert popups during testing, but notify parent
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = cameraTargetDocKey ? 640 : 300;
      canvas.height = cameraTargetDocKey ? 480 : 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        onCapture(dataUrl, cameraTargetDocKey);
      }
    }
    stopCamera();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => {
            stopCamera();
            onClose();
          }}
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
              padding: "24px",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                color: MAROON,
                marginBottom: "16px",
              }}
            >
              {cameraTargetDocKey ? "Scan Document" : "Take Photo"}
            </h3>

            {/* Video wrapper preview */}
            <div
              style={{
                width: cameraTargetDocKey ? "280px" : "180px",
                height: cameraTargetDocKey ? "190px" : "180px",
                borderRadius: cameraTargetDocKey ? "8px" : "50%",
                overflow: "hidden",
                margin: "0 auto 20px",
                border: `3px solid ${MAROON}`,
                background: "#000",
                position: "relative",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={handleCapture}
                style={{
                  background: MAROON,
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Camera size={16} /> Capture {cameraTargetDocKey ? "Document" : "Photo"}
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                style={{
                  background: "#faf8f5",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#4a4a4a",
                  cursor: "pointer",
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
