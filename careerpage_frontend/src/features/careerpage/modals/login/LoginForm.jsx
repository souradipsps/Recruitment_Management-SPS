import { useState } from "react";
import { Lock, User } from "lucide-react";
import { MAROON } from "../../../../lib/constants";
import { PasswordInput } from "./PasswordInput";
import { loginUser } from "./authService";

// Login tab: identifier (email or 10-digit phone) + password.
export function LoginForm({ onLoginSuccess, onClose, onSwitchTab, onForgotPassword }) {
  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login.identifier || !login.password) { setError("Please fill in all fields."); return; }

    const isEmail = login.identifier.includes("@");
    const isNumeric = /^\d+$/.test(login.identifier);
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login.identifier)) { setError("Please enter a valid email address."); return; }
    } else if (isNumeric) {
      if (!/^\d{10}$/.test(login.identifier)) { setError("Please enter a valid 10-digit phone number."); return; }
    }

    setError("");
    setSubmitting(true);
    try {
      const { name } = await loginUser({ identifier: login.identifier, password: login.password });
      onLoginSuccess?.(name);
      onClose();
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="lm-section-heading">
        <div className="lm-section-title">Welcome Back!</div>
        <div className="lm-section-sub">Login to access your account</div>
      </div>

      <form onSubmit={handleLogin} className="lm-form">
        <div className="lm-input-wrap">
          <User size={15} className="lm-input-icon" />
          <input
            type="text"
            placeholder="Number / Email"
            value={login.identifier}
            onChange={(e) => {
              const val = e.target.value;
              setLogin({ ...login, identifier: /^\d+$/.test(val) ? val.slice(0, 10) : val });
            }}
            className="lm-input"
          />
        </div>

        <PasswordInput
          value={login.password}
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        />

        <div className="lm-remember-row">
          <label className="lm-remember-label">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: MAROON }} />
            Remember Me
          </label>
          <a href="#" className="lm-forgot-link"
            onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>
            Forgot Password?
          </a>
        </div>

        {error && <div className="lm-error">{error}</div>}

        <button type="submit" className="lm-btn-primary" disabled={submitting}>
          <Lock size={14} /> LOGIN
        </button>
      </form>

      <div className="lm-switch-hint">Don't have an account?</div>
      <button onClick={() => onSwitchTab("signup")} className="lm-btn-outline">
        <User size={14} /> SIGN UP
      </button>
    </>
  );
}
