import { motion } from "motion/react";
import { Briefcase, Mail } from "lucide-react";
import { MAROON, GOLD, CREAM } from "../../../lib/constants";

const HIGHLIGHTS = [
  { icon: Briefcase, text: "All academic and administrative disciplines" },
  { icon: Mail, text: "Early notification for new openings" },
];

// "Talent Pool" call-to-action shown only to logged-out visitors, inviting
// them to submit a general profile.
export function TalentPoolSection({ onSubmitProfile }) {
  return (
    <section
      id="apply-anyway"
      style={{ background: `linear-gradient(135deg, ${CREAM} 0%, #f0e8d8 100%)` }}
      className="py-20 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ border: `1.5px solid rgba(107,26,26,0.15)`, background: "#fff" }}
          className="rounded-sm p-10 md:p-14 text-center"
        >
          <div style={{ color: GOLD, fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 700 }} className="uppercase mb-3">
            Talent Pool
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
            Don't See Your Role Listed?
          </h2>
          <div style={{ width: "50px", height: "3px", background: GOLD }} className="mt-4 mb-6 mx-auto" />
          <p style={{ color: "#4a3a3a", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto" }}>
            Submit your profile to our talent pool and be the first to hear when a role matching your expertise opens up at South Point School.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-5 mb-10">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} style={{ color: GOLD, flexShrink: 0 }} />
                <span style={{ color: "#4a3a3a", fontSize: "0.875rem" }}>{text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onSubmitProfile}
            style={{ background: MAROON, color: "#faf8f5", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.08em", display: "inline-block", border: "none", cursor: "pointer" }}
            className="px-12 py-4 rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Submit Profile
          </button>
        </motion.div>
      </div>
    </section>
  );
}
