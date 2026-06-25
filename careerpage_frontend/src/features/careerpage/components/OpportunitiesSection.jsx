import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { MAROON, GOLD } from "../../../lib/constants";
import { CATEGORIES } from "../../../data/jobs";
import { useJobFilters } from "../hooks/useJobFilters";
import { JobCard } from "./JobCard";

// "Current Opportunities" — search box, category filters and the job grid
// with progressive "See More" paging.
export function OpportunitiesSection({ onApplyJob, appliedJobIds }) {
  const {
    search,
    activeCategory,
    showAll,
    setShowAll,
    filteredJobs,
    visibleJobs,
    onSearchChange,
    onCategoryChange,
    JOBS_VISIBLE,
  } = useJobFilters();

  return (
    <section id="opportunities" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ color: GOLD, fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 700 }} className="uppercase mb-3">
            Open Positions
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 700 }}>
              Current Opportunities
            </h2>
            <div style={{ background: `rgba(107,26,26,0.07)`, border: `1.5px solid rgba(107,26,26,0.15)`, borderRadius: "999px", padding: "6px 18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: MAROON, fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{filteredJobs.length}</span>
              <span style={{ color: "#6b5c5c", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em" }} className="uppercase">
                Position{filteredJobs.length !== 1 ? "s" : ""} Available
              </span>
            </div>
          </div>
          <div style={{ width: "60px", height: "3px", background: GOLD }} className="mt-2 mb-8" />
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b5c5c", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by title or department…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ border: `1.5px solid rgba(107,26,26,0.2)`, background: "#fff", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", paddingLeft: "42px" }}
              className="py-3 pr-4 rounded-sm outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                style={{
                  border: `1.5px solid ${activeCategory === cat ? MAROON : "rgba(107,26,26,0.18)"}`,
                  background: activeCategory === cat ? MAROON : "#fff",
                  color: activeCategory === cat ? "#faf8f5" : "#4a3a3a",
                  fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                className="px-4 py-2.5 rounded-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Job listings */}
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleJobs.length > 0 ? (
              visibleJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <JobCard
                    job={job}
                    applied={appliedJobIds.includes(job.id)}
                    onApply={onApplyJob}
                    showOverlay={!showAll && i === visibleJobs.length - 1 && filteredJobs.length > JOBS_VISIBLE}
                    onSeeMore={() => setShowAll(true)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                <div style={{ color: "#6b5c5c", fontSize: "0.95rem" }}>
                  No positions found matching your search. Try a different keyword or category.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredJobs.length > JOBS_VISIBLE && showAll && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setShowAll(false);
                setTimeout(() => document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" }), 10);
              }}
              style={{ border: `1.5px solid ${MAROON}`, color: MAROON, fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.08em", background: "transparent", transition: "all 0.2s" }}
              className="px-10 py-3 rounded-sm uppercase tracking-wider"
            >
              Show Less
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
