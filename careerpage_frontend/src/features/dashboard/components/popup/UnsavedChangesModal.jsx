import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import "../css/popup/UnsavedChangesModal.css";

export function UnsavedChangesModal({ open, onDismiss, onDiscard, onSave }) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="uc-backdrop"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="uc-panel"
          >
            <div className="uc-icon-wrap">
              <AlertCircle size={28} color="#72102a" />
            </div>
            <h3 className="uc-title">
              Unsaved Changes
            </h3>
            <p className="uc-body">
              Are you sure you do not want to save the changes? If you proceed, your new resume upload will be lost.
            </p>

            <div className="uc-actions">
              <button
                onClick={onDiscard}
                className="uc-btn-discard"
              >
                Discard Changes
              </button>
              <button
                onClick={onSave}
                className="uc-btn-save"
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
