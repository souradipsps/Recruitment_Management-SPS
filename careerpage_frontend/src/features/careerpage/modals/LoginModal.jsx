import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Phone, Lock, X, User, Mail } from "lucide-react";
import logoImg from "../../../assets/logo.png";
import campusImg from "../../../assets/campus.jpg";

const MAROON = "#72102a";
const GOLD = "#c9a84c";

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export function LoginModal({ onClose, initialTab = "login", onLoginSuccess, onSignupSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [signup, setSignup] = useState({ name: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);

  useEffect(() => {
    let interval = null;
    if (tab === "forgot" && forgotStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tab, forgotStep, otpTimer]);

  useEffect(() => {
    setLoginError("");
    setSignupError("");
    setForgotError("");
  }, [tab]);

  const startOtpTimer = () => {
    setOtpTimer(30);
    setCanResendOtp(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!login.identifier || !login.password) {
      setLoginError("Please fill in all fields.");
      return;
    }
    const isEmail = login.identifier.includes("@");
    const isNumeric = /^\d+$/.test(login.identifier);
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(login.identifier)) {
        setLoginError("Please enter a valid email address.");
        return;
      }
    } else if (isNumeric) {
      if (!/^\d{10}$/.test(login.identifier)) {
        setLoginError("Please enter a valid 10-digit phone number.");
        return;
      }
    }
    setLoginError("");
    const name = login.identifier.includes("@") ? login.identifier.split("@")[0] : login.identifier;
    onLoginSuccess?.(name);
    onClose();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signup.name || !signup.email || !signup.phone || !signup.password || !signup.confirm) {
      setSignupError("Please fill in all required fields.");
      return;
    }
    const alphabetRegex = /^[a-zA-Z\s]+$/;
    if (!alphabetRegex.test(signup.name.trim())) {
      setSignupError("First name must contain alphabets only.");
      return;
    }
    if (signup.lastName && !/^[a-zA-Z\s]*$/.test(signup.lastName.trim())) {
      setSignupError("Last name must contain alphabets only.");
      return;
    }
    if (signup.phone.length !== 10) {
      setSignupError("Phone number must be exactly 10 digits.");
      return;
    }
    if (signup.password.length < 8) {
      setSignupError("Password must be at least 8 characters long.");
      return;
    }
    if (signup.password !== signup.confirm) {
      setSignupError("Passwords do not match.");
      return;
    }
    setSignupError("");
    setSignupSuccess(true);
    setTimeout(() => {
      setSignupSuccess(false);
      if (onSignupSuccess) {
        onSignupSuccess({ name: signup.name, lastName: signup.lastName, email: signup.email, phone: signup.phone });
        onClose();
      } else {
        setTab("login");
      }
    }, 1500);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotIdentifier)) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotError("");
    setForgotStep(2);
    startOtpTimer();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6) {
      setForgotError("Please enter a valid 6-digit OTP.");
      return;
    }
    setForgotError("");
    setForgotStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 8) {
      setForgotError("Password must be at least 8 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotError("");
    setForgotStep(4);
    setTimeout(() => {
      setTab("login");
      setForgotStep(1);
      setForgotIdentifier("");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
    }, 2000);
  };

  const handleResendOtp = () => {
    setForgotOtp("");
    setForgotError("");
    startOtpTimer();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <img src={campusImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(60,10,20,0.72)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "relative", background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}
        >
          <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(0,0,0,0.08)", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <X size={15} color="#555" />
          </button>

          <div style={{ background: `linear-gradient(160deg, ${MAROON} 0%, #4a0a1a 100%)`, padding: "28px 24px 20px", textAlign: "center" }}>
            <img src={logoImg} alt="South Point School" style={{ width: "64px", height: "64px", objectFit: "contain", margin: "0 auto 10px" }} />
            <div style={{ color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, letterSpacing: "0.05em" }}>SOUTH POINT SCHOOL</div>
            <div style={{ color: "rgba(250,248,245,0.7)", fontSize: "0.65rem", letterSpacing: "0.2em", marginTop: "2px" }}>GUWAHATI</div>
            <div style={{ color: GOLD, fontSize: "0.6rem", letterSpacing: "0.2em", marginTop: "2px", opacity: 0.8 }}>PURSUIT OF EXCELLENCE</div>
          </div>

          {tab !== "forgot" && (
            <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              {["login", "signup"].map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer", background: "transparent", color: tab === t ? MAROON : "#888", borderBottom: tab === t ? `2.5px solid ${MAROON}` : "2.5px solid transparent", transition: "all 0.2s" }}>
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: "24px" }}>
            {tab === "login" ? (
              <>
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.2rem", fontWeight: 700 }}>Welcome Back!</div>
                  <div style={{ color: "#6b5c5c", fontSize: "0.8rem", marginTop: "2px" }}>Login to access your account</div>
                </div>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                    <input
                      type="text"
                      placeholder="Number / Email"
                      value={login.identifier}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d+$/.test(val)) {
                          setLogin({ ...login, identifier: val.slice(0, 10) });
                        } else {
                          setLogin({ ...login, identifier: val });
                        }
                      }}
                      style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={login.password}
                      onChange={(e) => setLogin({ ...login, password: e.target.value })}
                      style={{ width: "100%", padding: "11px 36px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.78rem", color: "#555" }}>
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: MAROON }} />
                      Remember Me
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); setTab("forgot"); setForgotStep(1); setForgotIdentifier(""); setForgotOtp(""); setForgotNewPassword(""); setForgotConfirmPassword(""); setForgotError(""); }} style={{ color: MAROON, fontSize: "0.78rem", fontWeight: 600 }}>
                      Forgot Password?
                    </a>
                  </div>
                  {loginError && <div style={{ color: "#d00", fontSize: "0.78rem" }}>{loginError}</div>}
                  <button type="submit" style={{ background: MAROON, color: "#fff", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }} className="hover:opacity-90">
                    <Lock size={14} /> LOGIN
                  </button>
                </form>
                <div style={{ textAlign: "center", marginTop: "14px", fontSize: "0.78rem", color: "#6b5c5c" }}>Don't have an account?</div>
                <button onClick={() => setTab("signup")} style={{ width: "100%", marginTop: "8px", border: `1.5px solid ${MAROON}`, color: MAROON, background: "transparent", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.1em", borderRadius: "8px", padding: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <User size={14} /> SIGN UP
                </button>
              </>
            ) : tab === "signup" ? (
              signupSuccess ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "2rem" }}>✓</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "1.1rem", fontWeight: 700, marginTop: "8px" }}>Account Created!</div>
                  <div style={{ color: "#6b5c5c", fontSize: "0.82rem", marginTop: "4px" }}>Redirecting to login…</div>
                </motion.div>
              ) : (
                <>
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.2rem", fontWeight: 700 }}>Create Account</div>
                    <div style={{ color: "#6b5c5c", fontSize: "0.8rem", marginTop: "2px" }}>Join South Point School's portal</div>
                  </div>
                  <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ position: "relative" }}>
                        <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                        <input type="text" placeholder="First Name *" required value={signup.name} onChange={(e) => setSignup({ ...signup, name: capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, "")) })}
                          style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} />
                      </div>
                      <div style={{ position: "relative" }}>
                        <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                        <input type="text" placeholder="Last Name" value={signup.lastName} onChange={(e) => setSignup({ ...signup, lastName: capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, "")) })}
                          style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type="email" placeholder="Email Address *" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <Phone size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type="tel" placeholder="Phone Number *" inputMode="numeric" maxLength={10} required value={signup.phone}
                        onChange={(e) => setSignup({ ...signup, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} />
                      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: signup.phone.length === 10 ? "#065f46" : "#9ca3af" }}>{signup.phone.length}/10</span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type={showPassword ? "text" : "password"} placeholder="Password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                        style={{ width: "100%", padding: "11px 36px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={signup.confirm} onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                        style={{ width: "100%", padding: "11px 36px 11px 36px", border: `1.5px solid ${signup.confirm && signup.password !== signup.confirm ? "#d00" : "rgba(0,0,0,0.15)"}`, borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}>
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {signup.confirm && signup.password !== signup.confirm && <div style={{ color: "#d00", fontSize: "0.75rem" }}>Passwords do not match</div>}
                    {signupError && <div style={{ color: "#d00", fontSize: "0.78rem" }}>{signupError}</div>}
                    <button type="submit" style={{ background: MAROON, color: "#fff", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", transition: "opacity 0.2s" }} className="hover:opacity-90">
                      CREATE ACCOUNT
                    </button>
                  </form>
                  <button onClick={() => setTab("login")} style={{ width: "100%", marginTop: "10px", border: `1.5px solid ${MAROON}`, color: MAROON, background: "transparent", fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px", padding: "10px", cursor: "pointer" }}>
                    Already have an account? Login
                  </button>
                </>
              )
            ) : (
              <>
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.2rem", fontWeight: 700 }}>Reset Password</div>
                  <div style={{ color: "#6b5c5c", fontSize: "0.8rem", marginTop: "2px" }}>
                    {forgotStep === 1 && "Enter your email address to receive an OTP"}
                    {forgotStep === 2 && `Enter the OTP sent to ${forgotIdentifier}`}
                    {forgotStep === 3 && "Set your new password"}
                    {forgotStep === 4 && "Password reset successful!"}
                  </div>
                </div>

                {forgotError && <div style={{ color: "#d00", fontSize: "0.78rem", marginBottom: "12px" }}>{forgotError}</div>}

                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type="email" placeholder="Email Address" value={forgotIdentifier} onChange={(e) => setForgotIdentifier(e.target.value)}
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} required />
                    </div>
                    <button type="submit" style={{ background: MAROON, color: "#fff", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }} className="hover:opacity-90">
                      SEND OTP
                    </button>
                    <button type="button" onClick={() => setTab("login")} style={{ background: "transparent", color: MAROON, border: "none", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", alignSelf: "center", textDecoration: "underline" }}>
                      Back to Login
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ background: "#f0fdf4", border: "1.5px solid #6ee7b7", borderRadius: "8px", padding: "10px 12px", fontSize: "0.78rem", color: "#065f46", fontWeight: 600 }}>
                      Demo Mode: You can type any 6-digit OTP to verify.
                    </div>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type="text" placeholder="Enter 6-digit OTP" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box", letterSpacing: "0.15em" }} required />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                      <span style={{ color: "#6b5c5c" }}>{!canResendOtp ? `Resend OTP in ${otpTimer}s` : "Didn't receive OTP?"}</span>
                      {canResendOtp && (
                        <button type="button" onClick={handleResendOtp} style={{ background: "transparent", color: MAROON, border: "none", cursor: "pointer", fontWeight: 600, padding: 0, textDecoration: "underline", fontSize: "0.78rem" }}>
                          Resend OTP
                        </button>
                      )}
                    </div>
                    <button type="submit" style={{ background: MAROON, color: "#fff", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }} className="hover:opacity-90">
                      VERIFY OTP
                    </button>
                    <button type="button" onClick={() => setForgotStep(1)} style={{ background: "transparent", color: "#6b5c5c", border: "none", fontSize: "0.75rem", cursor: "pointer", alignSelf: "center", textDecoration: "underline" }}>
                      Change Email Address
                    </button>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type={showForgotNewPassword ? "text" : "password"} placeholder="New Password *" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)}
                        style={{ width: "100%", padding: "11px 36px 11px 36px", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} required />
                      <button type="button" onClick={() => setShowForgotNewPassword(!showForgotNewPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}>
                        {showForgotNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                      <input type={showForgotConfirmPassword ? "text" : "password"} placeholder="Confirm New Password *" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        style={{ width: "100%", padding: "11px 36px 11px 36px", border: `1.5px solid ${forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword ? "#d00" : "rgba(0,0,0,0.15)"}`, borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#faf8f5", color: "#1a0a0a", boxSizing: "border-box" }} required />
                      <button type="button" onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}>
                        {showForgotConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword && <div style={{ color: "#d00", fontSize: "0.75rem", marginTop: "-4px" }}>Passwords do not match</div>}
                    <button type="submit" style={{ background: MAROON, color: "#fff", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }} className="hover:opacity-90">
                      RESET PASSWORD
                    </button>
                  </form>
                )}

                {forgotStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: "2.5rem", color: "#065f46" }}>✓</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "1.15rem", fontWeight: 700, marginTop: "8px" }}>Password Reset Successful!</div>
                    <div style={{ color: "#6b5c5c", fontSize: "0.82rem", marginTop: "4px" }}>Redirecting you to login…</div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          <div style={{ background: "#f5f0e8", padding: "10px 20px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            {["Rukmini Gaon, Guwahati", "0381-2345678", "info@southpointguwahati.in"].map((item) => (
              <span key={item} style={{ color: "#6b5c5c", fontSize: "0.65rem" }}>{item}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
