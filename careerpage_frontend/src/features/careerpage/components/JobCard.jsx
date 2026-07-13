import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MapPin, IndianRupee, Briefcase, Share2, Check, ArrowRight } from "lucide-react";
import "./css/JobCard.css";

// A single opportunity card. `showOverlay` renders the blurred "See More"
// gate on the last visible card when more results are hidden.
export function JobCard({ job, applied, onApply, showOverlay, onSeeMore }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [heights, setHeights] = useState({ collapsedHeight: "2.75rem", expandedHeight: "auto" });
  const descRef = useRef(null);

  useEffect(() => {
    const element = descRef.current;
    if (!element) return;

    const checkOverflowAndHeights = () => {
      const computedStyle = window.getComputedStyle(element);
      const lineHeightVal = parseFloat(computedStyle.lineHeight);
      const fontSizeVal = parseFloat(computedStyle.fontSize);
      const lineHeight = isNaN(lineHeightVal) ? fontSizeVal * 1.65 : lineHeightVal;
      const isOver = element.scrollHeight > lineHeight * 2.2;
      
      setIsOverflowing(isOver);
      if (isOver) {
        setHeights({
          collapsedHeight: `${lineHeight * 2}px`,
          expandedHeight: `${element.scrollHeight}px`
        });
      }
    };

    checkOverflowAndHeights();

    const resizeObserver = new ResizeObserver(() => {
      checkOverflowAndHeights();
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [job.description]);

  const handleShare = () => {
    const text = `${job.title} at South Point School, Guwahati — ${job.type} | ${job.department}`;
    if (navigator.share) {
      navigator.share({ title: job.title, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      toast.success("Job details copied to clipboard!");
    }
  };

  const parseList = (arr) => {
    if (!arr) return [];
    return arr.flatMap((item) =>
      typeof item === "string"
        ? item.split(",").map((s) => s.trim()).filter(Boolean)
        : item
    );
  };

  return (
    <div id={`job-card-${job.id}`} className="job-card flex flex-col h-full">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="jc-header-container">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="jc-title">{job.title}</h3>
            <div className="jc-department-label">{job.department}</div>
          </div>
          <span className={`jc-type-badge ${job.type.toLowerCase().includes("full") ? "full-time" : "part-time"}`}>
            {job.type}
          </span>
        </div>
      </div>

      {/* ── Meta Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 px-6 pb-3">
        <div className="jc-meta-card">
          <span className="jc-meta-label">Location</span>
          <span className="jc-meta-val">
            <MapPin size={12} className="jc-meta-icon-mini" />
            <span>{job.location}</span>
          </span>
        </div>
        <div className="jc-meta-card">
          <span className="jc-meta-label">Experience</span>
          <span className="jc-meta-val">
            <Briefcase size={12} className="jc-meta-icon-mini" />
            <span>{job.experience ?? "2–5 yrs"}</span>
          </span>
        </div>
        <div className="jc-meta-card">
          <span className="jc-meta-label">Salary</span>
          <span className="jc-meta-val">
            <IndianRupee size={12} className="jc-meta-icon-mini" />
            <span>{job.salaryRange ?? "30k – 50k"}</span>
          </span>
        </div>
      </div>

      <div className="jc-divider" />

      {/* ── Description ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        <div
          className={`jc-description-container ${isOverflowing ? "interactive" : ""} ${isExpanded ? "expanded" : "collapsed"}`}
          onClick={() => isOverflowing && setIsExpanded(!isExpanded)}
          style={{
            height: isOverflowing 
              ? (isExpanded ? heights.expandedHeight : heights.collapsedHeight)
              : "auto"
          }}
          title={isOverflowing ? (isExpanded ? "Click to collapse" : "Click to view full description") : undefined}
        >
          <p ref={descRef} className="jc-description">
            {job.description}
          </p>
          {isOverflowing && (
            <div className="jc-description-fade">
              <span className="jc-ellipsis">&nbsp;...</span>
              <span className="jc-read-more-badge">Read more</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Qualifications & Skills ───────────────────────────────────────── */}
      <div className="px-6 pb-5 flex flex-col md:flex-row gap-6">
        {/* Left Column: Education */}
        <div className="flex-1">
          <div className="jc-section-label mb-3">Educational Qualifications</div>
          <ul className="flex flex-col gap-2">
            {parseList(job.qualifications).map((q) => (
              <li key={q} className="flex items-start gap-2">
                <span className="jc-bullet-wrapper">
                  <Check size={12} className="jc-bullet-check" />
                </span>
                <span className="jc-qual-text">{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Skills Checklist */}
        <div className="flex-1">
          <div className="jc-section-label mb-3">Required Skills & Strengths</div>
          <ul className="flex flex-col gap-2">
            {parseList(job.skills || ["Strong Communication", "Classroom Management", "Team Collaboration"]).map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="jc-bullet-wrapper">
                  <Check size={12} className="jc-bullet-check" />
                </span>
                <span className="jc-qual-text">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="mt-auto px-6 pb-6 pt-2 flex gap-3 items-center">
        {applied ? (
          <div className="jc-applied-badge">
            <Check size={16} />
            <span>Applied</span>
          </div>
        ) : (
          <button onClick={() => onApply(job)} className="jc-apply-btn flex items-center justify-center gap-2">
            <span>Apply Now</span>
            <ArrowRight size={15} className="jc-apply-arrow" />
          </button>
        )}
        <button onClick={handleShare} className="jc-share-btn" title="Share Job">
          <Share2 size={16} />
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
