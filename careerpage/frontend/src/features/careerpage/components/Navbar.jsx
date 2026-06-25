import { MAROON, GOLD } from "../../../lib/constants";
import logoImg from "../../../assets/logo.png";

// Sticky top navigation. Shows Login/Sign Up when logged out, and
// Dashboard/Log Out when logged in. Mirrors the same actions in a
// <details> dropdown on mobile.
export function Navbar({ loggedInUser, onLogin, onSignup, onOpenDashboard, onLogout }) {
  const closeMobileMenu = () =>
    document.getElementById("mobile-nav-menu")?.removeAttribute("open");

  return (
    <nav
      style={{
        background: "rgba(114,16,42,0.85)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
      className="sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3.5"
          >
            <img
              src={logoImg}
              alt="South Point School Logo"
              className="h-11 w-auto object-contain"
            />
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: GOLD,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                South Point School
              </div>
              <div
                style={{
                  color: "rgba(250,248,245,0.7)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                }}
                className="uppercase"
              >
                Guwahati, Assam
              </div>
            </div>
          </div>
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {loggedInUser ? (
              <>
                <button
                  onClick={onOpenDashboard}
                  style={{
                    border: `1.5px solid rgba(250,248,245,0.4)`,
                    color: "#faf8f5",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  style={{
                    background: GOLD,
                    color: "#1a0a0a",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    border: "none",
                    cursor: "pointer",
                  }}
                  className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  style={{
                    border: `1.5px solid rgba(250,248,245,0.4)`,
                    color: "#faf8f5",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center"
                >
                  Login
                </button>
                <button
                  onClick={onSignup}
                  style={{
                    background: GOLD,
                    color: "#1a0a0a",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    border: "none",
                    cursor: "pointer",
                  }}
                  className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
          {/* Mobile toggle */}
          <details
            id="mobile-nav-menu"
            className="sm:hidden"
            style={{ position: "relative" }}
          >
            <summary
              style={{
                listStyle: "none",
                cursor: "pointer",
                color: "#faf8f5",
                padding: "6px 8px",
                border: "1.5px solid rgba(250,248,245,0.35)",
                borderRadius: "4px",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ display: "block", width: "18px", height: "2px", background: "#faf8f5", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: "#faf8f5", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: "#faf8f5", borderRadius: "2px" }} />
            </summary>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: MAROON,
                border: "1.5px solid rgba(250,248,245,0.15)",
                borderRadius: "4px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: "130px",
                zIndex: 50,
                animation: "slideDown 0.2s ease",
              }}
            >
              {loggedInUser ? (
                <>
                  <button
                    onClick={() => {
                      onOpenDashboard();
                      closeMobileMenu();
                    }}
                    style={{ border: `1.5px solid rgba(250,248,245,0.4)`, color: "#faf8f5", fontWeight: 500, fontSize: "0.78rem", letterSpacing: "0.05em", background: "transparent", cursor: "pointer" }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center w-full"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      closeMobileMenu();
                    }}
                    style={{ background: GOLD, color: "#1a0a0a", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.05em", border: "none", cursor: "pointer" }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center w-full"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLogin();
                      closeMobileMenu();
                    }}
                    style={{ border: `1.5px solid rgba(250,248,245,0.4)`, color: "#faf8f5", fontWeight: 500, fontSize: "0.78rem", letterSpacing: "0.05em", background: "transparent", cursor: "pointer" }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:border-white transition-colors text-center w-full"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onSignup();
                      closeMobileMenu();
                    }}
                    style={{ background: GOLD, color: "#1a0a0a", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.05em", border: "none", cursor: "pointer" }}
                    className="px-3 py-1.5 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center w-full"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
