import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Phone, User, Mail } from "lucide-react";
import logoImg from "../../../../assets/logo.png";
import { PasswordInput } from "./PasswordInput";
import { signupUser } from "../../services/authService";

const capitalizeWords = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

// Signup tab: registration form plus the post-signup success screen that
// auto-redirects to login after 5 seconds.
export function SignupForm({ onSignupSuccess, onClose, onSwitchTab, onFormSubmit, onFormError }) {
  const [signup, setSignup] = useState({ name: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const handleProceed = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setSuccess(false);
    if (onSignupSuccess) {
      onSignupSuccess({ name: signup.name, lastName: signup.lastName, email: signup.email, phone: signup.phone });
    } else {
      onSwitchTab("login");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signup.name || !signup.email || !signup.phone || !signup.password || !signup.confirm) { setError("Please fill in all required fields."); return; }
    if (!/^[a-zA-Z\s]+$/.test(signup.name.trim())) { setError("First name must contain alphabets only."); return; }
    if (signup.lastName && !/^[a-zA-Z\s]*$/.test(signup.lastName.trim())) { setError("Last name must contain alphabets only."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signup.email.trim())) { setError("Please enter a valid email address."); return; }
    if (signup.phone.length !== 10) { setError("Phone number must be exactly 10 digits."); return; }
    if (signup.password.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (signup.password !== signup.confirm) { setError("Passwords do not match."); return; }

    setError("");
    setSubmitting(true);
    onFormSubmit?.(); // Show branded loader when form is submitted
    try {
      await signupUser({
        name: signup.name, lastName: signup.lastName, email: signup.email,
        phone: signup.phone, password: signup.password, confirmPassword: signup.confirm,
      });
      onFormError?.(); // Clear the loader immediately so they see the success screen
      setSuccess(true);
      redirectTimeoutRef.current = setTimeout(handleProceed, 5000);
    } catch (err) {
      setError(err.message || "Could not create account. Please try again.");
      onFormError?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="lm-signup-success"
      >
        <img src={logoImg} alt="South Point School Guwahati" className="lm-signup-success-logo" />
        <h3 className="lm-signup-success-title">Account Created Successfully!</h3>
        <div className="lm-signup-success-divider"></div>
        <p className="lm-signup-success-msg">
          Welcome to <strong>South Point School, Guwahati</strong>.
          Your candidate portal account has been successfully created.
        </p>
        <div className="lm-signup-success-next-steps">
          <h4>What's Next?</h4>
          <ul>
            <li>Log in with your credentials to access the candidate dashboard.</li>
            <li>Complete your profile setup and upload your CV/Resume.</li>
            <li>Apply directly for any open vacancies or submit a general application.</li>
          </ul>
        </div>
        <div className="lm-signup-success-loader-wrap">
          <span className="lm-signup-success-spinner"></span>
          <span className="lm-signup-success-redirect-msg">Redirecting to login in a few seconds…</span>
        </div>
        <button type="button" onClick={handleProceed} className="lm-signup-success-close">
          Proceed to Login
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="lm-section-heading">
        <div className="lm-section-title">Create Account</div>
        <div className="lm-section-sub">Join South Point School's portal</div>
      </div>

      <form onSubmit={handleSignup} className="lm-form">
        <div className="lm-name-grid">
          <div className="lm-input-wrap">
            <User size={15} className="lm-input-icon" />
            <input type="text" placeholder="First Name *" required value={signup.name}
              onChange={(e) => setSignup({ ...signup, name: capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, "")) })}
              className="lm-input" />
          </div>
          <div className="lm-input-wrap">
            <User size={15} className="lm-input-icon" />
            <input type="text" placeholder="Last Name" value={signup.lastName}
              onChange={(e) => setSignup({ ...signup, lastName: capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, "")) })}
              className="lm-input" />
          </div>
        </div>

        <div className="lm-input-wrap">
          <Mail size={15} className="lm-input-icon" />
          <input type="email" placeholder="Email Address *" required value={signup.email}
            onChange={(e) => setSignup({ ...signup, email: e.target.value })}
            className="lm-input" />
        </div>

        <div className="lm-input-wrap">
          <Phone size={15} className="lm-input-icon" />
          <input type="tel" placeholder="Phone Number *" inputMode="numeric" maxLength={10} required
            value={signup.phone}
            onChange={(e) => setSignup({ ...signup, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            className="lm-input" />
          <span className={`lm-phone-count ${signup.phone.length === 10 ? "lm-phone-count--ok" : "lm-phone-count--pending"}`}>
            {signup.phone.length}/10
          </span>
        </div>

        <PasswordInput
          value={signup.password}
          onChange={(e) => setSignup({ ...signup, password: e.target.value })}
        />

        <PasswordInput
          placeholder="Confirm Password"
          value={signup.confirm}
          onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
          invalid={!!signup.confirm && signup.password !== signup.confirm}
        />

        {signup.confirm && signup.password !== signup.confirm && (
          <div className="lm-error--sm">Passwords do not match</div>
        )}
        {error && <div className="lm-error">{error}</div>}

        <button type="submit" className="lm-btn-primary hover:opacity-90" disabled={submitting}>CREATE ACCOUNT</button>
      </form>

      <button onClick={() => onSwitchTab("login")} className="lm-btn-outline--sm">
        Already have an account? Login
      </button>
    </>
  );
}
