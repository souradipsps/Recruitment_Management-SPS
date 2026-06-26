import logoImg from "../../../assets/logo.png";
import "./css/Navbar.css";

// Sticky top navigation. Shows Login/Sign Up when logged out, and
// Dashboard/Log Out when logged in. Mirrors the same actions in a
// <details> dropdown on mobile.
export function Navbar({ loggedInUser, onLogin, onSignup, onOpenDashboard, onLogout }) {
  const closeMobileMenu = () =>
    document.getElementById("mobile-nav-menu")?.removeAttribute("open");

  return (
    <nav className="navbar sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">

          {/* ── Brand ───────────────────────────────────────────────────── */}
          <div
            className="navbar-brand flex items-center gap-3.5"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={logoImg} alt="South Point School Logo" className="h-11 w-auto object-contain" />
            <div>
              <div className="navbar-school-name">South Point School</div>
              <div className="navbar-school-sub">Guwahati, Assam</div>
            </div>
          </div>

          {/* ── Desktop buttons ──────────────────────────────────────────── */}
          <div className="hidden sm:flex items-center gap-2">
            {loggedInUser ? (
              <>
                <button onClick={onOpenDashboard} className="nb-btn nb-btn-outline px-3 py-1.5">
                  Dashboard
                </button>
                <button onClick={onLogout} className="nb-btn nb-btn-solid px-3 py-1.5">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button onClick={onLogin} className="nb-btn nb-btn-outline px-3 py-1.5">
                  Login
                </button>
                <button onClick={onSignup} className="nb-btn nb-btn-solid px-3 py-1.5">
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* ── Mobile hamburger dropdown ────────────────────────────────── */}
          <details id="mobile-nav-menu" className="sm:hidden" style={{ position: "relative" }}>
            <summary className="nb-hamburger">
              <span className="nb-hamburger-bar" />
              <span className="nb-hamburger-bar" />
              <span className="nb-hamburger-bar" />
            </summary>

            <div className="nb-mobile-dropdown">
              {loggedInUser ? (
                <>
                  <button
                    onClick={() => { onOpenDashboard(); closeMobileMenu(); }}
                    className="nb-btn nb-btn-outline px-3 py-1.5 w-full"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { onLogout(); closeMobileMenu(); }}
                    className="nb-btn nb-btn-solid px-3 py-1.5 w-full"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onLogin(); closeMobileMenu(); }}
                    className="nb-btn nb-btn-outline px-3 py-1.5 w-full"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { onSignup(); closeMobileMenu(); }}
                    className="nb-btn nb-btn-solid px-3 py-1.5 w-full"
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
