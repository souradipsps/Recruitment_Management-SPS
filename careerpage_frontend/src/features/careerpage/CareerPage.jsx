import { useState, useEffect, useRef } from "react";
import { CREAM } from "../../lib/constants";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { OpportunitiesSection } from "./components/OpportunitiesSection";
import { TalentPoolSection } from "./components/TalentPoolSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { FeedbackForm } from "./components/FeedbackForm";
import { Footer } from "./components/Footer";

// Public-facing career page. Presentation only — all auth/apply actions are
// passed in from App, which owns the cross-cutting modal + dashboard state.
export function CareerPage({
  loggedInUser,
  onLogin,
  onSignup,
  onOpenDashboard,
  onLogout,
  onApplyJob,
  appliedJobIds,
}) {
  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: CREAM,
        color: "#1a0a0a",
      }}
      className="min-h-screen"
    >
      <Navbar
        loggedInUser={loggedInUser}
        onLogin={onLogin}
        onSignup={onSignup}
        onOpenDashboard={onOpenDashboard}
        onLogout={onLogout}
      />
      <HeroSection loggedInUser={loggedInUser} />
      <OpportunitiesSection onApplyJob={onApplyJob} appliedJobIds={appliedJobIds} scrollDirection={scrollDirection} />
      {!loggedInUser && <TalentPoolSection onSubmitProfile={onSignup} scrollDirection={scrollDirection} />}
      <BenefitsSection scrollDirection={scrollDirection} />
      <FeedbackForm scrollDirection={scrollDirection} />
      <Footer />
    </div>
  );
}
