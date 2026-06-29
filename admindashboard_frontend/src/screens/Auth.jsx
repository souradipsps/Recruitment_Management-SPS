import { useState, useEffect } from "react";
import { T, font, radius, shadow } from "../theme";
import { Btn, Input, Select, FormField } from "../components/ui";

const DEFAULT_USERS = [
  { email: "admin@school.edu", password: "admin123", name: "Principal Admin", role: "admin" },
  { email: "dr.roy@school.edu", password: "roy123", name: "Dr. Roy", role: "Dr. Roy" },
  { email: "mr.patel@school.edu", password: "patel123", name: "Mr. Patel", role: "Mr. Patel" },
  { email: "ms.nisha@school.edu", password: "nisha123", name: "Ms. Nisha", role: "Ms. Nisha" },
];

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Retrieve or initialize users database in localStorage
  const getUsers = () => {
    try {
      const stored = localStorage.getItem("users");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // If not found or fails, set default users
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
      role: role,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setSuccess("Account created successfully! You can now Sign In.");
    setTimeout(() => {
      setTab("signin");
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
        background: `linear-gradient(135deg, ${T.primaryDark} 0%, ${T.primary} 50%, #200008 100%)`,
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
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          border: `1.5px solid ${T.accent}33`,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            padding: "32px 24px 28px",
            textAlign: "center",
            borderBottom: `3px solid ${T.accent}`,
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
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: font.extrabold,
                fontFamily: font.heading,
                color: T.accent,
                letterSpacing: "-0.02em",
              }}
            >
              South Point School
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              HR Recruitment Portal
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.canvas }}>
          <button
            onClick={() => {
              setTab("signin");
              setError("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "16px 0",
              background: tab === "signin" ? T.surface : "transparent",
              border: "none",
              borderBottom: tab === "signin" ? `2.5px solid ${T.primary}` : "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13.5,
              color: tab === "signin" ? T.primary : T.inkLight,
              transition: "all 0.2s",
            }}
          >
            Sign In
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
              background: tab === "signup" ? T.surface : "transparent",
              border: "none",
              borderBottom: tab === "signup" ? `2.5px solid ${T.primary}` : "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13.5,
              color: tab === "signup" ? T.primary : T.inkLight,
              transition: "all 0.2s",
            }}
          >
            Sign Up
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

          {tab === "signin" ? (
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <FormField label="Email Address">
                <Input
                  type="email"
                  placeholder="e.g. admin@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>

              <Btn label="Sign In" variant="primary" style={{ marginTop: 8, padding: "11px 0" }} />

              <div
                style={{
                  fontSize: 11,
                  color: T.inkFaint,
                  textAlign: "center",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                <strong>Default Accounts:</strong>
                <br />
                Admin: admin@school.edu / admin123
                <br />
                Panelist (Dr. Roy): dr.roy@school.edu / roy123
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <FormField label="Full Name">
                <Input
                  type="text"
                  placeholder="e.g. Dr. Ananya Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormField>

              <FormField label="Email Address">
                <Input
                  type="email"
                  placeholder="e.g. custom@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Password">
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>

              <FormField label="Assign System Role">
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={[
                    { value: "admin", label: "Principal (Admin)" },
                    { value: "Dr. Roy", label: "Dr. Roy (Panelist)" },
                    { value: "Mr. Patel", label: "Mr. Patel (Panelist)" },
                    { value: "Ms. Nisha", label: "Ms. Nisha (Panelist)" },
                  ]}
                />
              </FormField>

              <Btn label="Create Account" variant="primary" style={{ marginTop: 8, padding: "11px 0" }} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
