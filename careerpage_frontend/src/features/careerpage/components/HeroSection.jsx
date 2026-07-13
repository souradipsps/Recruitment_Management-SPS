import { motion } from "motion/react";
import { Award, TrendingUp, Users, Heart } from "lucide-react";
import { stats } from "../../../mockData/jobs";
import campusImg from "../../../assets/campus.jpg";
import "./css/HeroSection.css";

const TRUST_INDICATORS = [
  { icon: Award,      text: "60+ Years of Excellence"      },
  { icon: TrendingUp, text: "Career Growth Opportunities"  },
  { icon: Users,      text: "Inclusive Community"          },
  { icon: Heart,      text: "Meaningful Impact"            },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function HeroSection({ loggedInUser }) {
  return (
    <section className="hero-section relative overflow-hidden">
      {/* ── Background campus image ───────────────────────────────────── */}
      <motion.img
        src={campusImg}
        alt="South Point School Campus"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.12, filter: "brightness(0.6)" }}
        animate={{ scale: 1, filter: "brightness(1)" }}
        transition={{ duration: 8, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* ── Gradient overlay ──────────────────────────────────────────── */}
      <div className="hero-overlay absolute inset-0" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="hero-content relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left column */}
          <div className="flex flex-col justify-center">
            <h1 className="hero-heading">
              <div className="overflow-hidden block py-1">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                >
                  Build Your Future.
                </motion.span>
              </div>
              <div className="overflow-hidden block py-1">
                <motion.span
                  className="block hero-heading-accent"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                  Shape the Next Generation.
                </motion.span>
              </div>
            </h1>

            {/* Staggered container for subtext, buttons and trust tags */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.35
                  }
                }
              }}
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="hero-subtext mt-5 max-w-lg"
              >
                At South Point School, every role contributes to excellence in education and character building.
                Join a community that inspires, supports, and empowers future generations.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <a
                  href="#opportunities"
                  onClick={(e) => { e.preventDefault(); scrollTo("opportunities"); }}
                  className="hero-btn-primary px-7 py-3 transition-transform hover:scale-[1.03] active:scale-[0.98] duration-200"
                >
                  Explore Opportunities
                </a>

                {!loggedInUser && (
                  <button
                    onClick={() => scrollTo("apply-anyway")}
                    className="hero-btn-outline px-7 py-3 transition-transform hover:scale-[1.03] active:scale-[0.98] duration-200"
                  >
                    Submit Profile
                  </button>
                )}
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="mt-10 grid grid-cols-2 gap-3"
              >
                {TRUST_INDICATORS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon size={14} className="trust-icon" />
                    <span className="trust-text">{text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right column — Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.5
                }
              }
            }}
            className="flex flex-col justify-center gap-8"
          >
            {stats.map(({ value, label }) => (
              <motion.div
                key={label}
                variants={{
                  hidden: { opacity: 0, x: 40, scale: 0.95 },
                  visible: { 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    transition: { type: "spring", stiffness: 75, damping: 14 } 
                  }
                }}
                className="stat-item"
              >
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
