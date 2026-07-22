import { useRef, useState } from "react";
import { T } from "../../theme";
import { CATEGORY_OPTIONS } from "../../data";

/** Initials avatar used on mobile cards. */
function Avatar({ name, size = 48, fs = 16 }) {
  const val = name || "RQ";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "rgba(255,255,255,0.15)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: fs, flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.25)",
    }}>
      {val.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
    </div>
  );
}

/**
 * Mobile horizontal card carousel.
 * Each card shows key request details and quick Accept / Reject buttons.
 */
export default function ApprovalListMobile({ filtered, openModal, performAction, isActionPending }) {
  const scrollRef = useRef(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
        {filtered.length} request{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Horizontal scroll carousel */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const { scrollLeft, clientWidth } = e.currentTarget;
          if (clientWidth > 0) setCurrentCardIndex(Math.round(scrollLeft / clientWidth));
        }}
        className="carousel-scroll"
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          gap: 12,
          paddingBottom: 20,
          margin: "0 -12px",
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        {filtered.map((r, idx) => (
          <div
            /* Key on the unique backend pk, not r.id (= request_id): a request can
               be sent back multiple times, leaving several Sent Back approvals that
               share one request_id. Using r.id there caused duplicate React keys,
               which broke the Sent Back filter's rendering. */
            key={r.backendId ?? r.id}
            onClick={() => openModal(r)}
            style={{
              flexShrink: 0,
              width: "calc(100% - 24px)",
              scrollSnapAlign: "center",
              borderRadius: 20,
              background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
              color: "#fff",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              padding: 24,
              position: "relative",
              boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
              minHeight: 380,
              cursor: "pointer",
            }}
          >
            {/* Card counter badge */}
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
              padding: "4px 12px", borderRadius: 99,
              fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              {idx + 1} of {filtered.length}
            </div>

            {/* Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 40 }}>
                <Avatar name={r.role || r.type || "Request"} />
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role}</h3>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                    {r.dept && r.dept !== "N/A" ? `${r.dept} · ` : ""}{r.requestedBy}
                  </div>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
              borderRadius: 14, padding: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", flexDirection: "column", gap: 10,
              marginTop: 16, flex: 1,
            }}>
              {[
                { icon: "🆔", label: "Request ID", value: String(r.sourceId).substring(0, 16) },
                { icon: "📋", label: "Type",        value: r.type || "Request" },
                { icon: "📅", label: "Date",        value: r.date },
                ...(r.category  ? [{ icon: "🏷️", label: "Category",   value: CATEGORY_OPTIONS.find((c) => c.value === r.category)?.label || r.category }] : []),
                ...(r.salary    ? [{ icon: "💰", label: "Salary",      value: r.salary }] : []),
                ...(r.experience? [{ icon: "⏳", label: "Experience",  value: `${r.experience} yrs` }] : []),
                ...(r.vacancies ? [{ icon: "👥", label: "Vacancies",   value: String(r.vacancies) }] : []),
                ...(r.empType   ? [{ icon: "💼", label: "Emp Type",    value: r.empType }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}

              {r.comment && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: 2 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Comment</div>
                  <div style={{ fontSize: 12, color: "#FBBF24", background: "rgba(245,158,11,0.15)", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)" }}>
                    {r.comment}
                  </div>
                </div>
              )}
            </div>

            {/* Status / action footer */}
            <div
              style={{ padding: "12px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Status</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {r.status === "Pending" ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      disabled={isActionPending}
                      onClick={() => performAction(r, "Approved")}
                      style={{ background: "rgba(16,185,129,0.25)", color: "#34D399", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: isActionPending ? "not-allowed" : "pointer", opacity: isActionPending ? 0.6 : 1 }}
                    >Accept</button>
                    <button
                      disabled={isActionPending}
                      onClick={() => performAction(r, "Rejected")}
                      style={{ background: "rgba(239,68,68,0.25)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: isActionPending ? "not-allowed" : "pointer", opacity: isActionPending ? 0.6 : 1 }}
                    >Reject</button>
                  </div>
                ) : (() => {
                  // Per-status badge styling. Each terminal status gets its own
                  // label/colour so "Sent Back" and "Cancelled" are distinguishable
                  // (previously everything non-Approved/Rejected showed as "Sent Back").
                  const STATUS_STYLES = {
                    Approved:    { label: "✓ Approved",  bg: "rgba(16,185,129,0.25)", color: "#34D399", border: "rgba(16,185,129,0.4)" },
                    Rejected:    { label: "✕ Rejected",  bg: "rgba(239,68,68,0.25)",  color: "#FCA5A5", border: "rgba(239,68,68,0.4)" },
                    "Sent Back": { label: "↺ Sent Back", bg: "rgba(245,158,11,0.25)", color: "#FBBF24", border: "rgba(245,158,11,0.4)" },
                    Cancelled:   { label: "⊘ Cancelled", bg: "rgba(148,163,184,0.25)", color: "#CBD5E1", border: "rgba(148,163,184,0.4)" },
                  };
                  const s = STATUS_STYLES[r.status] || { label: r.status, bg: "rgba(148,163,184,0.25)", color: "#CBD5E1", border: "rgba(148,163,184,0.4)" };
                  return (
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: s.bg,
                      color: s.color,
                      padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                      border: `1px solid ${s.border}`,
                    }}>
                      {s.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot pagination */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
          {filtered.map((_, i) => (
            <div
              key={i}
              onClick={() => scrollRef.current?.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" })}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: currentCardIndex === i ? T.primary : T.border,
                cursor: "pointer", transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
