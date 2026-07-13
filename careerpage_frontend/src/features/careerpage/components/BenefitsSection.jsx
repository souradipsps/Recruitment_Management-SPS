import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, ArrowRight } from "lucide-react";
import { benefits } from "../../../mockData/jobs";
import "./css/BenefitsSection.css";

const BENEFIT_DETAILS = {
  "Continuous Learning": {
    longDesc: "We believe that exceptional teachers are lifelong learners. South Point School fully sponsors attendance at regional and national pedagogical workshops, CBSE capacity-building programs, and advanced diploma certifications. Educators are also provided access to digital resource libraries and research publications to stay ahead in modern instruction.",
    highlights: ["100% Sponsored Pedagogical Workshops", "CBSE Training Credits & Certifications", "Support for Advanced Degree Pursuits"]
  },
  "Health & Wellness": {
    longDesc: "Your well-being is our priority. We offer comprehensive medical insurance policies covering inpatient treatments for you and your family. In addition, our campus features dedicated fitness facilities, annual health screenings, and employee counseling programs to foster a healthy, stress-free work environment.",
    highlights: ["Comprehensive Family Health Insurance", "On-Campus Health & Wellness Center", "Professional Counseling & Mental Care"]
  },
  "Job Security": {
    longDesc: "Build a stable, long-term career with Guwahati's most trusted educational institution. We offer clear contract structures, provident fund benefits, and transparent, performance-driven annual appraisal processes. Over 60% of our senior staff have been with us for more than a decade.",
    highlights: ["Provident Fund & Gratuity Benefits", "Structured & Secure Employment Contracts", "Transparent Annual Appraisal & Increments"]
  },
  "Collaborative Culture": {
    longDesc: "Teach in an environment where your voice is heard. Our inter-disciplinary academic councils meet regularly to share best practices, plan collaborative events, and coordinate classroom strategies. Mentorship programs match senior educators with new team members to ensure a warm onboarding.",
    highlights: ["Structured Mentorship for New Hires", "Weekly Peer Collaboration & Lesson Planning", "Open-door Leadership Policy for Feedback"]
  },
  "Career Advancement": {
    longDesc: "We promote from within. Our structured leadership track helps educators transition smoothly from assistant teachers to subject department heads, academic coordinators, house masters, and administrative leadership roles through focused training programs.",
    highlights: ["Priority for Internal Promotions", "Leadership & Management Training Tracks", "Role Diversification Opportunities"]
  },
  "Recognition & Rewards": {
    longDesc: "Outstanding contributions never go unnoticed. Our Annual Excellence Awards celebrate teaching innovation, community impact, and extra-curricular guidance. This is accompanied by performance-based bonuses, paid sabbaticals for research, and public profiles on our portal.",
    highlights: ["Annual Excellence Awards & Honors", "Performance-Linked Cash Bonuses", "Sabbaticals & Research Opportunities"]
  }
};

// "Why Build Your Career at South Point School?" — grid of benefit cards.
export function BenefitsSection() {
  const [activeBenefit, setActiveBenefit] = useState(null);

  // Lock body scroll when benefit modal is active
  useEffect(() => {
    if (activeBenefit) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, [activeBenefit]);

  const handleOpenPopup = (benefit) => {
    const details = BENEFIT_DETAILS[benefit.title] || {
      longDesc: benefit.desc,
      highlights: ["Professional Environment", "Growth Mindset", "Institutional Support"]
    };
    setActiveBenefit({ ...benefit, ...details });
  };

  const handleClosePopup = () => {
    setActiveBenefit(null);
  };

  return (
    <section id="benefits" className="benefits-section py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <p className="benefits-eyebrow">What We Offer</p>

          <h2 className="benefits-heading">
            Why Build Your Career at South Point School?
          </h2>

          <div className="benefits-divider" />
        </motion.div>

        {/* ── Benefits grid ──────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const { icon: Icon, title, desc } = benefit;
            return (
              <motion.div
                key={title}
                className="benefit-card flex flex-col justify-between"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ type: "spring", stiffness: 70, damping: 15, delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenPopup(benefit)}
              >
                <div>
                  <div className="benefit-icon-wrapper">
                    <Icon size={22} className="benefit-icon" />
                  </div>

                  <h3 className="benefit-card-title">{title}</h3>

                  <p className="benefit-card-desc">{desc}</p>
                </div>

                <div className="benefit-card-footer mt-4">
                  <span className="benefit-learn-more flex items-center gap-1.5">
                    <span>Learn More</span>
                    <ArrowRight size={14} className="benefit-arrow" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Popup Modal ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {activeBenefit && (
            <motion.div 
              className="benefit-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePopup}
            >
              <motion.div 
                className="benefit-modal-card"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button className="benefit-modal-close" onClick={handleClosePopup}>
                  <X size={20} />
                </button>

                {/* Modal Header */}
                <div className="benefit-modal-header flex items-center gap-4 mb-5">
                  <div className="benefit-modal-icon-wrapper">
                    <activeBenefit.icon size={28} className="benefit-modal-icon" />
                  </div>
                  <div>
                    <h3 className="benefit-modal-title">{activeBenefit.title}</h3>
                    <p className="benefit-modal-subtitle">South Point School Advantage</p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="benefit-modal-body">
                  <p className="benefit-modal-desc mb-6">{activeBenefit.longDesc}</p>

                  <h4 className="benefit-modal-section-title mb-3">Key Highlights</h4>
                  <ul className="benefit-modal-list flex flex-col gap-3">
                    {activeBenefit.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="benefit-modal-check-wrapper">
                          <Check size={13} className="benefit-modal-check" />
                        </span>
                        <span className="benefit-modal-highlight-text">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal Footer */}
                <div className="benefit-modal-footer mt-8">
                  <button className="benefit-modal-btn" onClick={handleClosePopup}>
                    Got It, Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
