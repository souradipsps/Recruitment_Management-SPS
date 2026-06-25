import { motion } from "motion/react";
import { MAROON, GOLD, CREAM } from "../../../lib/constants";
import { benefits } from "../../../data/jobs";

// "Why Build Your Career at South Point School?" — grid of benefit cards.
export function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 px-6" style={{ background: "#fff" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ color: GOLD, fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 700 }} className="uppercase mb-3">
            What We Offer
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 700 }}>
            Why Build Your Career at South Point School?
          </h2>
          <div style={{ width: "60px", height: "3px", background: GOLD }} className="mt-4 mb-12" />
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ border: `1.5px solid rgba(107,26,26,0.1)`, background: CREAM }}
              className="p-7 rounded-sm group hover:shadow-lg transition-all"
            >
              <div style={{ background: `rgba(107,26,26,0.08)`, display: "inline-flex", borderRadius: "4px" }} className="p-3 mb-5">
                <Icon size={22} style={{ color: MAROON }} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.05rem", fontWeight: 600 }} className="mb-3">
                {title}
              </h3>
              <p style={{ color: "#6b5c5c", fontSize: "0.875rem", lineHeight: 1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
