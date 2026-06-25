import { toast } from "sonner";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { MAROON } from "../../../lib/constants";
import { experienceById } from "../../../data/jobs";

// A single opportunity card. `showOverlay` renders the blurred "See More"
// gate on the last visible card when more results are hidden.
export function JobCard({ job, applied, onApply, showOverlay, onSeeMore }) {
  const handleShare = () => {
    const text = `${job.title} at South Point School, Guwahati — ${job.type} | ${job.department}`;
    if (navigator.share) {
      navigator.share({ title: job.title, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      toast.success("Job details copied to clipboard!");
    }
  };

  return (
    <div
      id={`job-card-${job.id}`}
      style={{ border: `1.5px solid rgba(0,0,0,0.1)`, background: "#fff", transition: "all 0.25s", position: "relative", overflow: "hidden", borderRadius: "10px" }}
      className="flex flex-col h-full hover:shadow-lg"
    >
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3 }}>
            {job.title}
          </h3>
          <span style={{ background: `rgba(114,16,42,0.1)`, color: MAROON, fontSize: "0.7rem", fontWeight: 600, whiteSpace: "nowrap", borderRadius: "999px", padding: "3px 10px", flexShrink: 0 }}>
            {job.type}
          </span>
        </div>
        <div style={{ color: "#6b5c5c", fontSize: "0.8rem" }}>{job.department}</div>
      </div>
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", margin: "0 20px" }} />
      <div className="px-5 pt-3 pb-3 flex flex-wrap gap-4">
        <span style={{ color: MAROON, fontSize: "0.78rem" }} className="flex items-center gap-1">
          <MapPin size={12} />{job.location}
        </span>
        <span style={{ color: MAROON, fontSize: "0.78rem" }} className="flex items-center gap-1">
          <Briefcase size={12} />
          {experienceById[job.id] ?? "2–5 yrs"}
        </span>
        <span style={{ color: MAROON, fontSize: "0.78rem" }} className="flex items-center gap-1">
          <Clock size={12} />{job.type}
        </span>
      </div>
      <div className="px-5 pb-3">
        <p style={{ color: "#4a4a4a", fontSize: "0.82rem", lineHeight: 1.65 }}>{job.description}</p>
      </div>
      <div className="px-5 pb-4">
        <div style={{ color: "#1a0a0a", fontSize: "0.82rem", fontWeight: 700 }} className="mb-2">Key Qualifications:</div>
        <ul className="flex flex-col gap-1">
          {job.qualifications.map((q) => (
            <li key={q} className="flex items-start gap-2">
              <span style={{ color: MAROON, fontSize: "1rem", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>•</span>
              <span style={{ color: "#4a4a4a", fontSize: "0.78rem", lineHeight: 1.5 }}>{q}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto px-5 pb-5 flex gap-2">
        {applied ? (
          <div style={{ flex: 1, background: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", padding: "11px", gap: "6px", border: "1px solid #6ee7b7" }}>
            ✓ Applied
          </div>
        ) : (
          <button
            onClick={() => onApply(job)}
            style={{ background: MAROON, color: "#fff", fontWeight: 600, fontSize: "0.85rem", display: "block", textAlign: "center", borderRadius: "6px", padding: "11px", letterSpacing: "0.03em", transition: "opacity 0.2s", flex: 1, border: "none", cursor: "pointer" }}
            className="hover:opacity-90"
          >
            Apply Now
          </button>
        )}
        <button
          onClick={handleShare}
          style={{ border: `1.5px solid ${MAROON}`, color: MAROON, fontWeight: 600, fontSize: "0.78rem", borderRadius: "6px", padding: "11px 14px", background: "transparent", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}
          className="hover:opacity-80"
        >
          Share
        </button>
      </div>
      {showOverlay && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "absolute", inset: 0, backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", background: "rgba(255,255,255,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", borderRadius: "10px" }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onSeeMore(); }}
            style={{ background: "#c9a84c", color: "#1a0a0a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", border: "none", borderRadius: "999px", padding: "10px 24px", boxShadow: "0 4px 14px rgba(201,168,76,0.4)", cursor: "pointer" }}
          >
            + See More
          </button>
          <span style={{ color: "#4a3a3a", fontSize: "0.78rem", fontWeight: 500 }}>More opportunities available</span>
        </div>
      )}
    </div>
  );
}
