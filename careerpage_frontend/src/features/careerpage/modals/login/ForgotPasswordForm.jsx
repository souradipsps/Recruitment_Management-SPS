import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Mail } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword } from "./authService";

// Forgot-password flow: 1) email → 2) OTP → 3) new password → 4) success.
export function ForgotPasswordForm({ onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [otpTimer, setOtpTimer] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);

  useEffect(() => {
    let interval = null;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [step, otpTimer]);

  const startOtpTimer = () => { setOtpTimer(30); setCanResendOtp(false); };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) { setError("Please enter a valid email address."); return; }

    setError("");
    setSubmitting(true);
    try {
      await sendPasswordResetOtp({ email: identifier });
      setStep(2); startOtpTimer();
    } catch (err) {
      setError(err.message || "Could not send OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError("Please enter a valid 6-digit OTP."); return; }

    setError("");
    setSubmitting(true);
    try {
      await verifyPasswordResetOtp({ email: identifier, otp });
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setError("");
    setSubmitting(true);
    try {
      await resetPassword({ email: identifier, otp, newPassword });
      setStep(4);
      setTimeout(() => { onBackToLogin(); }, 2000);
    } catch (err) {
      setError(err.message || "Could not reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = () => { setOtp(""); setError(""); startOtpTimer(); };

  return (
    <>
      <div className="lm-section-heading">
        <div className="lm-section-title">Reset Password</div>
        <div className="lm-section-sub">
          {step === 1 && "Enter your email address to receive an OTP"}
          {step === 2 && `Enter the OTP sent to ${identifier}`}
          {step === 3 && "Set your new password"}
          {step === 4 && "Password reset successful!"}
        </div>
      </div>

      {error && <div className="lm-error" style={{ marginBottom: 12 }}>{error}</div>}

      {/* Step 1 — Email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="lm-form--gap14">
          <div className="lm-input-wrap">
            <Mail size={15} className="lm-input-icon" />
            <input type="email" placeholder="Email Address" value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="lm-input" required />
          </div>
          <button type="submit" className="lm-btn-primary hover:opacity-90" disabled={submitting}>SEND OTP</button>
          <button type="button" onClick={onBackToLogin} className="lm-btn-text">Back to Login</button>
        </form>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="lm-form--gap14">
          <div className="lm-otp-banner">Demo Mode: You can type any 6-digit OTP to verify.</div>
          <div className="lm-input-wrap">
            <Lock size={15} className="lm-input-icon" />
            <input type="text" placeholder="Enter 6-digit OTP" value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="lm-input" style={{ letterSpacing: "0.15em" }} required />
          </div>
          <div className="lm-otp-row">
            <span className="lm-otp-timer">{!canResendOtp ? `Resend OTP in ${otpTimer}s` : "Didn't receive OTP?"}</span>
            {canResendOtp && (
              <button type="button" onClick={handleResendOtp} className="lm-otp-resend-btn">Resend OTP</button>
            )}
          </div>
          <button type="submit" className="lm-btn-primary hover:opacity-90" disabled={submitting}>VERIFY OTP</button>
          <button type="button" onClick={() => setStep(1)} className="lm-btn-text--muted">Change Email Address</button>
        </form>
      )}

      {/* Step 3 — New password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="lm-form--gap14">
          <PasswordInput
            placeholder="New Password *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <PasswordInput
            placeholder="Confirm New Password *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            invalid={!!confirmPassword && newPassword !== confirmPassword}
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <div className="lm-error--sm" style={{ marginTop: -4 }}>Passwords do not match</div>
          )}
          <button type="submit" className="lm-btn-primary hover:opacity-90" disabled={submitting}>RESET PASSWORD</button>
        </form>
      )}

      {/* Step 4 — Success */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lm-reset-success">
          <div className="lm-reset-success-icon">✓</div>
          <div className="lm-reset-success-title">Password Reset Successful!</div>
          <div className="lm-reset-success-msg">Redirecting you to login…</div>
        </motion.div>
      )}
    </>
  );
}
