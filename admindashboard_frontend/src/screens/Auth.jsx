import { useState, useEffect } from "react";
import { T, font, radius, shadow } from "../theme";

const DEFAULT_USERS = [
  { email: "admin@school.edu", password: "admin123", name: "Principal Admin", role: "admin" },
  { email: "dr.roy@school.edu", password: "roy123", name: "Dr. Roy", role: "Dr. Roy" },
  { email: "mr.patel@school.edu", password: "patel123", name: "Mr. Patel", role: "Mr. Patel" },
  { email: "ms.nisha@school.edu", password: "nisha123", name: "Ms. Nisha", role: "Ms. Nisha" },
];

function FormLabel({ text }) {
  return (
    <label style={{
      fontSize: 11,
      fontWeight: "800",
      color: "#374151",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 8,
      display: "block",
    }}>
      {text}
    </label>
  );
}

function CustomInput({ icon, type = "text", placeholder, value, onChange, showPasswordToggle, onToggleShowPassword }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      border: `1.5px solid #d1d5db`,
      borderRadius: 12,
      background: "#fff",
      overflow: "hidden",
      transition: "border-color 0.2s",
      width: "100%",
    }}
    className="input-focus-container"
    >
      <div style={{
        width: 44,
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1.5px solid #e5e7eb",
        color: T.primary,
        background: "rgba(114, 16, 42, 0.02)",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "10px 14px",
          fontSize: 14,
          fontFamily: font.body,
          color: T.ink,
          background: "transparent",
          width: "100%",
        }}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onToggleShowPassword}
          style={{
            background: "none",
            border: "none",
            padding: "0 14px",
            cursor: "pointer",
            color: "#6B6B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {type === "password" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {}
  }, []);

  const getUsers = () => {
    try {
      const stored = localStorage.getItem("users");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const users = getUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (!foundUser) {
      setError("Invalid email or password.");
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem("remembered_email", email.trim());
      } else {
        localStorage.removeItem("remembered_email");
      }
    } catch (err) {}

    setSuccess("Login successful!");
    setTimeout(() => {
      onLoginSuccess(foundUser);
    }, 500);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const users = getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: "admin",
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setSuccess("Account created successfully! You can now Log in.");
    setTimeout(() => {
      setTab("login");
      setEmail(newUser.email);
      setPassword("");
      setError("");
      setSuccess("");
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(135deg, rgba(92, 12, 33, 0.55) 0%, rgba(30, 3, 10, 0.75) 100%), url('/school_campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: 20,
        fontFamily: font.body,
        boxSizing: "border-box",
      }}
    >
      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: 420,
          background: T.surface,
          borderRadius: 24,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          border: `1.5px solid ${T.accent}44`,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            padding: "32px 24px 28px",
            textAlign: "center",
            borderBottom: `2.5px solid ${T.accent}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src="/images-removebg-preview.png"
            alt="South Point School Logo"
            style={{ height: 60, width: "auto", objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: "bold",
                fontFamily: "Georgia, serif",
                color: T.accent,
                letterSpacing: "0.01em",
              }}
            >
              South Point School
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ width: 16, height: 1, background: "rgba(255, 255, 255, 0.3)" }} />
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                HR Recruitment Portal
              </p>
              <div style={{ width: 16, height: 1, background: "rgba(255, 255, 255, 0.3)" }} />
            </div>
            <div style={{ fontSize: 8, color: T.accent, marginTop: 4, lineHeight: 1 }}>◆</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.canvas }}>
          <button
            onClick={() => {
              setTab("login");
              setError("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "16px 0",
              background: tab === "login" ? T.surface : "#f8f9fa",
              border: "none",
              borderBottom: tab === "login" ? `3px solid ${T.primary}` : "1px solid #e8e2d9",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              color: tab === "login" ? T.primary : "#6B6B6B",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Log in</span>
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setError("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "16px 0",
              background: tab === "signup" ? T.surface : "#f8f9fa",
              border: "none",
              borderBottom: tab === "signup" ? `3px solid ${T.primary}` : "1px solid #e8e2d9",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              color: tab === "signup" ? T.primary : "#6B6B6B",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Sign Up</span>
          </button>
        </div>

        {/* Auth Forms */}
        <div style={{ padding: "30px 28px" }}>
          {error && (
            <div
              style={{
                background: T.redLight,
                border: `1px solid ${T.red}33`,
                color: T.red,
                padding: "10px 14px",
                borderRadius: radius.md,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 20,
                lineHeight: 1.4,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: T.greenLight,
                border: `1px solid ${T.green}33`,
                color: T.green,
                padding: "10px 14px",
                borderRadius: radius.md,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 20,
                lineHeight: 1.4,
              }}
            >
              ✓ {success}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <FormLabel text="Email Address" />
                <CustomInput
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  }
                  type="email"
                  placeholder="e.g. admin@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <FormLabel text="Password" />
                <CustomInput
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  }
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle={true}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -4 }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: "pointer",
                    accentColor: T.primary,
                  }}
                />
                <label
                  htmlFor="rememberMe"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: T.inkLight,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Remember Me
                </label>
              </div>

              <button
                type="submit"
                className="btn-hover"
                style={{
                  background: `linear-gradient(135deg, ${T.primary} 0%, #4c0519 100%)`,
                  border: "none",
                  borderRadius: 99,
                  padding: "12px 0",
                  width: "100%",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 20px rgba(114, 16, 42, 0.2)",
                  marginTop: 8,
                  transition: "all 0.2s"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>Log in</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <FormLabel text="Full Name" />
                <CustomInput
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  }
                  type="text"
                  placeholder="e.g. Dr. Ananya Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <FormLabel text="Email Address" />
                <CustomInput
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  }
                  type="email"
                  placeholder="e.g. f@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <FormLabel text="Password" />
                <CustomInput
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  }
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle={true}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                />
              </div>

              <button
                type="submit"
                className="btn-hover"
                style={{
                  background: `linear-gradient(135deg, ${T.primary} 0%, #4c0519 100%)`,
                  border: "none",
                  borderRadius: 99,
                  padding: "12px 0",
                  width: "100%",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 20px rgba(114, 16, 42, 0.2)",
                  marginTop: 8,
                  transition: "all 0.2s"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                  <path d="M9 21.5L9.67 18.33L12.83 17.67L9.67 17L9 13.83L8.33 17L5.17 17.67L8.33 18.33L9 21.5ZM16.5 13.5L17 11.17L19.33 10.67L17 10.17L16.5 7.83L16 10.17L13.67 10.67L16 11.17L16.5 13.5ZM6.5 10.5L7.17 7.33L10.33 6.67L7.17 6L6.5 2.83L5.83 6L2.67 6.67L5.83 7.33L6.5 10.5Z" />
                </svg>
                <span>Create Account</span>
              </button>
            </form>
          )}

          {/* OR divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 11, color: "#9CA3AF", padding: "0 12px", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          {/* Footer redirection */}
          <div style={{ textAlign: "center", fontSize: 13, color: "#4B5563" }}>
            {tab === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  style={{
                    border: "none",
                    background: "none",
                    color: T.primary,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  style={{
                    border: "none",
                    background: "none",
                    color: T.primary,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Log in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
