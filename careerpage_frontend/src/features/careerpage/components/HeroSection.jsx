import { motion } from "motion/react";
import { Award, TrendingUp, Users, Heart } from "lucide-react";
import { GOLD } from "../../../lib/constants";
import { stats } from "../../../data/jobs";
import campusImg from "../../../assets/campus.jpg";

const TRUST_INDICATORS = [
  { icon: Award, text: "60+ Years of Excellence" },
  { icon: TrendingUp, text: "Career Growth Opportunities" },
  { icon: Users, text: "Inclusive Community" },
  { icon: Heart, text: "Meaningful Impact" },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function HeroSection({ loggedInUser }) {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>
      <img
        src={campusImg}
        alt="South Point School Campus"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.78) 30%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.15) 100%)`,
        }}
      />
      <div
        className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center"
        style={{ minHeight: "88vh" }}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#faf8f5",
                fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                lineHeight: 1.15,
                fontWeight: 700,
              }}
            >
              Build Your Future.
              <br />
              <span style={{ color: GOLD }}>Shape the Next Generation.</span>
            </h1>
            <p
              style={{ color: "rgba(250,248,245,0.78)", fontSize: "1rem", lineHeight: 1.8 }}
              className="mt-5 max-w-lg"
            >
              At South Point School, every role contributes to excellence in education and character building.
              Join a community that inspires, supports, and empowers future generations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#opportunities"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("opportunities");
                }}
                style={{ background: GOLD, color: "#1a0a0a", fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.06em" }}
                className="px-7 py-3 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
              >
                Explore Opportunities
              </a>
              {!loggedInUser && (
                <button
                  onClick={() => scrollTo("apply-anyway")}
                  style={{ border: `1.5px solid rgba(250,248,245,0.45)`, color: "#faf8f5", fontWeight: 500, fontSize: "0.875rem", background: "transparent", cursor: "pointer" }}
                  className="px-7 py-3 rounded-sm hover:border-white transition-colors"
                >
                  Submit Profile
                </button>
              )}
            </div>
            {/* Trust Indicators */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {TRUST_INDICATORS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={14} style={{ color: GOLD, flexShrink: 0 }} />
                  <span style={{ color: "rgba(250,248,245,0.7)", fontSize: "0.78rem" }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column — Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col justify-center gap-8"
          >
            {stats.map(({ value, label }) => (
              <div key={label} style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: "20px" }}>
                <div style={{ color: "#faf8f5", fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
                <div
                  style={{ color: "rgba(250,248,245,0.6)", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 600 }}
                  className="uppercase mt-1"
                >
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
