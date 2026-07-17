import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import logoImg from "../../../assets/logo.png";
import campusImg from "../../../assets/campus.jpg";
import "./css/LoginModal.css";
import { LoginForm } from "./login/LoginForm";
import { SignupForm } from "./login/SignupForm";
import { ForgotPasswordForm } from "./login/ForgotPasswordForm";

// Modal shell: renders the backdrop, header, tab bar and footer, and swaps
// between the login / signup / forgot-password forms. Each form owns its own
// state and talks to the backend through ../services/authService.
//
// `initialTab` tracks the /login vs /signup URL; `onTabChange` reports back
// when the user switches tabs from inside the modal so the parent can keep
// the URL in sync (browser back/forward, refresh, deep links). The
// forgot-password tab has no route of its own, so it stays purely local.
export function LoginModal({ onClose, initialTab = "login", onLoginSuccess, onSignupSuccess, onFormSubmit, onFormError, onTabChange }) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab === "login" || initialTab === "signup") setTab(initialTab);
  }, [initialTab]);

  const handleSwitchTab = (next) => {
    setTab(next);
    if (next === "login" || next === "signup") onTabChange?.(next);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="lm-backdrop"
        onClick={onClose}
      >
        {/* Background */}
        <img src={campusImg} alt="" className="lm-bg-image" />
        <div className="lm-bg-overlay" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="lm-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="lm-close-btn"><X size={15} /></button>

          {/* Header */}
          <div className="lm-header">
            <img src={logoImg} alt="South Point School Crest" className="lm-header-logo" />
            <div className="lm-header-school">SOUTH POINT SCHOOL</div>
            <div className="lm-header-city">GUWAHATI</div>
            <div className="lm-header-motto">PURSUIT OF EXCELLENCE</div>
          </div>


          <div className="lm-content">
            {tab === "login" && (
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onClose={onClose}
                onSwitchTab={handleSwitchTab}
                onForgotPassword={() => setTab("forgot")}
                onFormSubmit={onFormSubmit}
                onFormError={onFormError}
              />
            )}

            {tab === "signup" && (
              <SignupForm
                onSignupSuccess={onSignupSuccess}
                onClose={onClose}
                onSwitchTab={handleSwitchTab}
                onFormSubmit={onFormSubmit}
                onFormError={onFormError}
              />
            )}

            {tab === "forgot" && (
              <ForgotPasswordForm onBackToLogin={() => setTab("login")} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
