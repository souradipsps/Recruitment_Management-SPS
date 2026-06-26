import { toast } from "sonner";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { experienceById } from "../../../data/jobs";
import "./css/JobCard.css";

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
    <div id={`job-card-${job.id}`} className="job-card flex flex-col h-full">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="jc-title">{job.title}</h3>
          <span className="jc-type-badge">{job.type}</span>
        </div>
        <div className="jc-department">{job.department}</div>
      </div>

      <div className="jc-divider" />

      {/* ── Meta row ────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-3 flex flex-wrap gap-4">
        <span className="jc-meta-item flex items-center gap-1">
          <MapPin size={12} />{job.location}
        </span>
        <span className="jc-meta-item flex items-center gap-1">
          <Briefcase size={12} />{experienceById[job.id] ?? "2–5 yrs"}
        </span>
        <span className="jc-meta-item flex items-center gap-1">
          <Clock size={12} />{job.type}
        </span>
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        <p className="jc-description">{job.description}</p>
      </div>

      {/* ── Qualifications ──────────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        <div className="jc-qual-heading mb-2">Key Qualifications:</div>
        <ul className="flex flex-col gap-1">
          {job.qualifications.map((q) => (
            <li key={q} className="flex items-start gap-2">
              <span className="jc-qual-bullet">•</span>
              <span className="jc-qual-text">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="mt-auto px-5 pb-5 flex gap-2">
        {applied ? (
          <div className="jc-applied-badge">✓ Applied</div>
        ) : (
          <button onClick={() => onApply(job)} className="jc-apply-btn">
            Apply Now
          </button>
        )}
        <button onClick={handleShare} className="jc-share-btn">
          Share
        </button>
      </div>

      {/* ── "See More" blur overlay ──────────────────────────────────────── */}
      {showOverlay && (
        <div className="jc-overlay" onClick={(e) => e.stopPropagation()}>
          <button
            className="jc-see-more-btn"
            onClick={(e) => { e.stopPropagation(); onSeeMore(); }}
          >
            + See More
          </button>
          <span className="jc-overlay-hint">More opportunities available</span>
        </div>
      )}

    </div>
  );
}
