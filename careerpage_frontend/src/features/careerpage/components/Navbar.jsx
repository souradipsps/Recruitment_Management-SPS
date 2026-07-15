import { useState, useEffect, useRef } from "react";
import logoImg from "../../../assets/logo.png";
import "./css/Navbar.css";

// Native `window.scrollTo({ behavior: "smooth" })` gets cancelled the moment
// it's called mid-gesture (e.g. while a touch scroll is still decelerating),
// so it just halts the page instead of reversing direction. Driving the
// scroll ourselves every frame means a click always wins over any residual
// momentum and actually takes the user to the top.
function scrollToTopSmooth(rafRef) {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);

  const startY = window.scrollY;
  const startTime = performance.now();
  // Scale duration based on distance: min 350ms, max 750ms
  const duration = Math.min(Math.max(startY * 0.3, 350), 750);

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Cubic ease-out: f(t) = 1 - (1 - t)^3
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    window.scrollTo(0, startY * (1 - easeProgress));

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      rafRef.current = null;
    }
  };
  rafRef.current = requestAnimationFrame(step);
}

// Sticky top navigation. Shows Login/Sign Up when logged out, and
// Dashboard/Log Out when logged in. Mirrors the same actions in a
// full-screen overlay on mobile.
export function Navbar({ loggedInUser, onLogin, onSignup, onOpenDashboard, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const scrollRafRef = useRef(null);

  const toggleMobileMenu = () => setIsOpen((prev) => !prev);
  const closeMobileMenu = () => setIsOpen(false);
  const handleScrollToTop = () => scrollToTopSmooth(scrollRafRef);

  useEffect(() => () => {
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setScrolledDown(true);
      } else {
        setScrolledDown(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Reset viewport meta tag to force the mobile browser to recalculate scales
    // and layout width when returning from the external non-responsive site in the same tab.
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=5.0");
    const timer = setTimeout(() => {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <nav className="navbar sticky top-0 z-50 shadow-lg flex items-center" style={{ height: "76px" }}>
        <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">

          {/* ── Brand ───────────────────────────────────────────────────── */}
          <a
            href="https://www.spsghy.co.in"
            className="navbar-brand flex items-center gap-3.5"
            style={{ textDecoration: "none" }}
            onClick={closeMobileMenu}
          >
            <img src={logoImg} alt="South Point School Logo" className="h-11 w-auto object-contain" />
            <div>
              <div className="navbar-school-name">South Point School</div>
              <div className="navbar-school-sub">Guwahati, Assam</div>
            </div>
          </a>

          {/* ── Scroll to Top (Middle Desktop Only) ────────────────────── */}
          <div
            className={`hidden sm:flex flex-1 justify-center items-center cursor-pointer navbar-scroll-area mx-8 ${scrolledDown ? "is-visible" : ""}`}
            onClick={handleScrollToTop}
            title="Scroll to Top"
          >
            <div className="modern-arrow-wrapper">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="modern-arrow-svg"
              >
                <polyline points="3 16 12 7 21 16" />
              </svg>
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

          {/* ── Mobile hamburger ─────────────────────────────────────────── */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className={`nb-hamburger sm:hidden ${isOpen ? "is-active" : ""}`}
            aria-label="Toggle menu"
          >
            <span className="nb-hamburger-bar" />
            <span className="nb-hamburger-bar" />
            <span className="nb-hamburger-bar" />
          </button>

        </div>
      </nav>

      {/* ── Mobile Scroll to Top Button (Floating just below Navbar) ── */}
      <div
        className={`nb-mobile-scroll-wrapper sm:hidden fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${scrolledDown ? "top-[88.5px] opacity-100 scale-102" : "-top-10 opacity-0 scale-75 pointer-events-none"
          }`}
      >
        <button
          onClick={handleScrollToTop}
          className="nb-mobile-scroll-btn flex items-center justify-center bg-white rounded-full border border-gray-100 p-2 cursor-pointer text-[#72102a] hover:bg-gray-50 active:scale-95 transition-all"
          style={{
            width: "56px",
            height: "56px",
            boxShadow: "0 8px 24px rgba(114, 16, 42, 0.22)"
          }}
          title="Scroll to Top"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      {/* ── Mobile menu overlay and panel ───────────────────────────────── */}
      <div className={`nb-mobile-panel-wrapper ${isOpen ? "is-open" : ""}`}>
        <div className="nb-mobile-panel" onClick={(e) => e.stopPropagation()}>
          <div className="nb-mobile-actions">
            {loggedInUser ? (
              <>
                <button
                  onClick={() => { onOpenDashboard(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-outline"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { onLogout(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-solid"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onLogin(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-outline"
                >
                  Login
                </button>
                <button
                  onClick={() => { onSignup(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-solid"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
        <div className="nb-mobile-backdrop" onClick={closeMobileMenu} />
      </div>
    </>
  );
}

