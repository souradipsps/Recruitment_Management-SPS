import { useState, useRef, useEffect } from "react";
import { T, shadow, font, radius, transition } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Badge, Modal, ModalHeader } from "../components/ui";

// ── Demo data matching the career page form fields ──────────────────────────
// Fields: name, email, category (Academic|Administrative|Operations|General),
//         rating (1-5), message
const DEMO_FEEDBACK = [
  {
    id: "FB-001",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    category: "Academic",
    rating: 5,
    message: "The application process was incredibly smooth and well-organized. I loved how easy it was to upload documents and track my application status in real-time. Great experience!",
    date: "2026-07-22T10:30:00",
  },
  {
    id: "FB-002",
    name: "Arjun Das",
    email: "arjun.das@email.com",
    category: "Academic",
    rating: 4,
    message: "The interview panel was very professional and the questions were relevant to the role. The online meeting setup worked flawlessly. Would have appreciated more feedback on my performance.",
    date: "2026-07-22T09:15:00",
  },
  {
    id: "FB-003",
    name: "Meera Sen",
    email: "meera.sen@email.com",
    category: "Administrative",
    rating: 3,
    message: "The career page looks clean but I had trouble finding the general application form. It would be helpful to have a more prominent link on the main page.",
    date: "2026-07-21T16:45:00",
  },
  {
    id: "FB-004",
    name: "Rahul Dravid",
    email: "rahul.d@email.com",
    category: "General",
    rating: 5,
    message: "Excellent communication throughout the hiring process. I received timely updates about my application status and interview schedule. The HR team was very responsive to my queries.",
    date: "2026-07-21T14:20:00",
  },
  {
    id: "FB-005",
    name: "Nisha Agarwal",
    email: "nisha.a@email.com",
    category: "Operations",
    rating: 2,
    message: "The application form was too long and I lost my progress when my browser refreshed. There should be an auto-save feature. Also, the file upload size limit was too restrictive for my portfolio.",
    date: "2026-07-20T11:00:00",
  },
  {
    id: "FB-006",
    name: "Vikram Seth",
    email: "vikram.s@email.com",
    category: "Academic",
    rating: 4,
    message: "Great variety of positions listed. The filters for department and experience level made it easy to find relevant openings. The salary range transparency is much appreciated.",
    date: "2026-07-20T09:30:00",
  },
  {
    id: "FB-007",
    name: "Kunal Kapoor",
    email: "kunal.k@email.com",
    category: "General",
    rating: 1,
    message: "The website kept crashing on mobile. I had to switch to my laptop to complete my application. The mobile experience needs significant improvement.",
    date: "2026-07-19T15:10:00",
  },
  {
    id: "FB-008",
    name: "Aditi Rao",
    email: "aditi.rao@email.com",
    category: "Administrative",
    rating: 5,
    message: "Best recruitment portal I have ever used! The dashboard to track application progress is a game-changer. Also loved the fact that I could apply to multiple positions with a single profile.",
    date: "2026-07-19T12:00:00",
  },
  {
    id: "FB-009",
    name: "Sonal Verma",
    email: "sonal.verma@email.com",
    category: "Operations",
    rating: 3,
    message: "Applied two weeks ago and haven't heard back yet. The portal says 'Under Review' but there's no indication of timeline. It would be nice to have estimated response times.",
    date: "2026-07-18T10:45:00",
  },
  {
    id: "FB-010",
    name: "Sachin Tendulkar",
    email: "sachin.t@email.com",
    category: "Academic",
    rating: 4,
    message: "The interview process was well-structured with clear rounds. The panelists were knowledgeable and asked practical questions. The virtual platform worked without any hiccups.",
    date: "2026-07-17T14:30:00",
  },
];

// ── Category display labels ─────────────────────────────────────────────────
const categoryLabels = {
  Academic: "Academic",
  Administrative: "Administrative",
  Operations: "Operations & Support",
  General: "General",
};

const categoryColors = {
  Academic: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  Administrative: { bg: "#F3E8FF", color: "#7C3AED", border: "#DDD6FE" },
  Operations: { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  General: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
};

// ── Star Rating Component ───────────────────────────────────────────────────
const Stars = ({ count, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        style={{
          fontSize: size,
          color: i <= count ? "#F59E0B" : "#D1D5DB",
          lineHeight: 1,
        }}
      >
        ★
      </span>
    ))}
  </span>
);

// ── Time Ago Helper ─────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

// ── Custom Styled Floating Select Component ───────────────────────────────
const CustomSelect = ({ value, onChange, options, icon }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: radius.md,
          border: `1.5px solid ${open ? T.primary : T.border}`,
          background: open ? "#fff" : T.canvas,
          fontSize: font.sm,
          fontFamily: font.body,
          color: T.ink,
          cursor: "pointer",
          transition: transition.fast,
          boxShadow: open ? "0 0 0 3px rgba(114, 16, 42, 0.12)" : "none",
          userSelect: "none",
        }}
      >
        {icon && <span style={{ fontSize: 13, opacity: 0.7 }}>{icon}</span>}
        <span style={{ fontWeight: font.bold }}>{selectedOption?.label}</span>
        <span
          style={{
            fontSize: 9,
            color: T.inkFaint,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            marginLeft: 4,
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="animate-fade-in-up"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: 180,
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: radius.md,
            boxShadow: shadow.md,
            padding: 6,
            zIndex: 9999,
          }}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: radius.sm || 6,
                  fontSize: font.sm,
                  fontFamily: font.body,
                  fontWeight: isSelected ? font.bold : font.medium,
                  color: isSelected ? T.primary : T.ink,
                  background: isSelected ? T.primaryLight : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: transition.fast,
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = T.canvas;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <span style={{ color: T.primary, fontWeight: font.bold, fontSize: 12 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Feedback Component ─────────────────────────────────────────────────
export default function Feedback() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [feedback] = useState(DEMO_FEEDBACK);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Academic", "Administrative", "Operations", "General"];
  const ratings = ["All", "5", "4", "3", "2", "1"];

  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c === "All" ? "All Categories" : categoryLabels[c] || c,
  }));

  const ratingOptions = ratings.map((r) => ({
    value: r,
    label: r === "All" ? "All Ratings" : `${r} Star${r === "1" ? "" : "s"}`,
  }));

  const filteredFeedback = feedback.filter((f) => {
    if (filterCategory !== "All" && f.category !== filterCategory) return false;
    if (filterRating !== "All" && f.rating !== Number(filterRating)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "0.0";
  const totalCount = feedback.length;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: feedback.filter((f) => f.rating === r).length,
  }));
  const maxCount = Math.max(...ratingDist.map((r) => r.count), 1);

  return (
    <div style={{ padding: isMobile ? 12 : 0, minHeight: "100%" }}>
      {/* Header */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: isMobile ? 20 : 22,
              fontWeight: font.extrabold,
              fontFamily: font.body,
              color: T.ink,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            💬 Career Page Feedback
          </h2>
          <p
            style={{
              fontSize: font.sm,
              color: T.inkLight,
              margin: "4px 0 0",
              fontFamily: font.body,
            }}
          >
            Feedback submitted by candidates from the career portal
          </p>
        </div>
      </div>

      {/* Top Row: Avg Rating + Rating Distribution */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
          gap: 14,
          marginBottom: 20,
          animationDelay: "0.05s",
        }}
      >
        {/* Average Rating Card */}
        <Card style={{ textAlign: "center", padding: "20px 16px" }}>
          <div style={{ fontSize: 40, fontWeight: font.extrabold, fontFamily: font.body, color: T.ink, lineHeight: 1 }}>
            {avgRating}
          </div>
          <Stars count={Math.round(Number(avgRating))} size={18} />
          <div style={{ fontSize: font.xs, color: T.inkFaint, fontFamily: font.body, marginTop: 6 }}>
            {totalCount} total reviews
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ratingDist.map((r) => (
              <div key={r.star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: font.xs, fontWeight: font.bold, fontFamily: font.body, color: T.inkMid, width: 14, textAlign: "right" }}>
                  {r.star}
                </span>
                <span style={{ fontSize: 12, color: "#F59E0B" }}>★</span>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: T.border,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(r.count / maxCount) * 100}%`,
                      borderRadius: 4,
                      background: r.star >= 4 ? "#059669" : r.star === 3 ? "#D97706" : "#DC2626",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: font.xs, color: T.inkFaint, fontFamily: font.body, width: 16, textAlign: "right" }}>
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card
        className="animate-fade-in-up"
        style={{
          padding: isMobile ? "12px 14px" : "16px 20px",
          marginBottom: 16,
          animationDelay: "0.1s",
          overflow: "visible",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ flex: isMobile ? "1 1 100%" : "1 1 240px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: T.inkFaint,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8.5px 14px 8.5px 36px",
                borderRadius: radius.md,
                border: `1.5px solid ${T.border}`,
                fontSize: font.sm,
                fontFamily: font.body,
                color: T.ink,
                outline: "none",
                background: T.canvas,
                transition: transition.fast,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category Filter */}
          <CustomSelect
            value={filterCategory}
            onChange={setFilterCategory}
            options={categoryOptions}
            icon="🏷️"
          />

          {/* Rating Filter */}
          <CustomSelect
            value={filterRating}
            onChange={setFilterRating}
            options={ratingOptions}
            icon="⭐"
          />

          {/* Result count */}
          <span
            style={{
              fontSize: font.xs,
              fontWeight: font.medium,
              color: T.inkFaint,
              fontFamily: font.body,
              marginLeft: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {filteredFeedback.length} of {feedback.length}
          </span>
        </div>
      </Card>

      {/* Feedback List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredFeedback.length === 0 && (
          <Card
            className="animate-fade-in"
            style={{ textAlign: "center", padding: 44 }}
          >
            <div style={{ fontSize: 42, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: font.md, fontWeight: font.bold, fontFamily: font.body, color: T.inkMid }}>
              No feedback matches your filters
            </div>
            <div style={{ fontSize: font.sm, color: T.inkLight, fontFamily: font.body, marginTop: 6 }}>
              Try adjusting your search or filter criteria
            </div>
          </Card>
        )}

        {filteredFeedback.map((fb, idx) => {
          const catCfg = categoryColors[fb.category] || categoryColors.General;
          const ratingColor = fb.rating >= 4 ? T.green : fb.rating === 3 ? "#D97706" : "#DC2626";

          return (
            <Card
              key={fb.id}
              className="animate-fade-in-up"
              hover
              onClick={() => setSelectedFeedback(fb)}
              style={{
                cursor: "pointer",
                padding: isMobile ? "14px 16px" : "18px 22px",
                animationDelay: `${0.03 * idx}s`,
                borderLeft: `4px solid ${ratingColor}`,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 12 : 16,
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryMid})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: font.sm,
                    fontWeight: font.bold,
                    fontFamily: font.body,
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(114, 16, 42, 0.15)",
                  }}
                >
                  {fb.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
                </div>

                {/* Content Container */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header row: Name, Email & Time */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: font.base, fontWeight: font.bold, fontFamily: font.body, color: T.ink, letterSpacing: "-0.01em" }}>
                        {fb.name}
                      </span>
                      <span style={{ fontSize: font.xs, color: T.inkFaint, fontFamily: font.body }}>
                        {fb.email}
                      </span>
                    </div>
                    <span style={{ fontSize: font.xs, color: T.inkFaint, fontFamily: font.body, fontWeight: font.medium }}>
                      {timeAgo(fb.date)}
                    </span>
                  </div>

                  {/* Rating + Category pill */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <Stars count={fb.rating} size={15} />
                    <span
                      style={{
                        fontSize: font.xs,
                        fontWeight: font.bold,
                        fontFamily: font.body,
                        padding: "3px 10px",
                        borderRadius: radius.full,
                        background: catCfg.bg,
                        color: catCfg.color,
                        border: `1px solid ${catCfg.border}`,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {categoryLabels[fb.category] || fb.category}
                    </span>
                  </div>

                  {/* Message preview text */}
                  <p
                    style={{
                      fontSize: font.sm,
                      fontFamily: font.body,
                      color: T.inkMid,
                      margin: 0,
                      lineHeight: 1.6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {fb.message}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <Modal onClose={() => setSelectedFeedback(null)}>
          <ModalHeader onClose={() => setSelectedFeedback(null)}>
            Feedback Details
          </ModalHeader>

          <div style={{ padding: "0 24px 24px" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryMid})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: font.base,
                  fontWeight: font.bold,
                  fontFamily: font.body,
                }}
              >
                {selectedFeedback.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: font.md, fontWeight: font.extrabold, fontFamily: font.body, color: T.ink }}>
                  {selectedFeedback.name}
                </div>
                <div style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkLight }}>
                  {selectedFeedback.email}
                </div>
              </div>
            </div>

            {/* Meta grid — only the actual fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: font.xs, fontWeight: font.bold, fontFamily: font.body, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Overall Rating
                </div>
                <Stars count={selectedFeedback.rating} size={18} />
              </div>
              <div>
                <div style={{ fontSize: font.xs, fontWeight: font.bold, fontFamily: font.body, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Category
                </div>
                {(() => {
                  const cc = categoryColors[selectedFeedback.category] || categoryColors.General;
                  return (
                    <span
                      style={{
                        fontSize: font.xs,
                        fontWeight: font.bold,
                        fontFamily: font.body,
                        padding: "3px 10px",
                        borderRadius: radius.full,
                        background: cc.bg,
                        color: cc.color,
                        border: `1px solid ${cc.border}`,
                      }}
                    >
                      {categoryLabels[selectedFeedback.category] || selectedFeedback.category}
                    </span>
                  );
                })()}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <div style={{ fontSize: font.xs, fontWeight: font.bold, fontFamily: font.body, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Submitted
                </div>
                <span style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkMid }}>
                  {new Date(selectedFeedback.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Full Message */}
            <div>
              <div style={{ fontSize: font.xs, fontWeight: font.bold, fontFamily: font.body, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Feedback Message
              </div>
              <div
                style={{
                  background: T.canvas,
                  borderRadius: radius.md,
                  padding: 16,
                  border: `1px solid ${T.border}`,
                  fontSize: font.sm,
                  fontFamily: font.body,
                  color: T.ink,
                  lineHeight: 1.7,
                }}
              >
                "{selectedFeedback.message}"
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
