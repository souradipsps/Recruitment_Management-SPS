import { T, font, radius, transition } from "../theme";

// Global header: branding on the left, page label / pending badge / actions on the right.
export default function TopBar({
  isMobile,
  isCompact,
  pageLabel,
  pendingCount,
  onOpenSidebar,
  onNavPending,
  onBackToModules,
}) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryMid} 100%)`,
        borderBottom: `2px solid ${T.accent}`,
        padding: "0 24px", height: 60, display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 100,
      }}
    >
      {/* Left: hamburger (mobile) + school branding */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16 }}>
        {isCompact && (
          <button
            onClick={onOpenSidebar}
            className="btn-hover"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: radius.md,
              cursor: "pointer", padding: "6px 8px",
              color: T.canvas, fontSize: 18, lineHeight: 1,
              transition: transition.fast,
            }}
          >
            ☰
          </button>
        )}
        <img
          src="/images-removebg-preview.png"
          alt="South Point School Logo"
          style={{ height: isMobile ? 36 : 44, width: "auto", objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{
            fontSize: isMobile ? font.base : font.lg,
            fontWeight: font.extrabold,
            fontFamily: font.heading,
            color: T.accent,
            letterSpacing: "-0.01em", lineHeight: 1.2,
          }}>
            South Point School
          </div>
          <div style={{
            fontSize: isMobile ? 9 : font.xs,
            fontWeight: font.semibold,
            fontFamily: font.body,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.3, marginTop: 1,
          }}>
            Guwahati, Assam
          </div>
        </div>
      </div>

      {/* Right: page label + pending */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!isMobile && (
          <span style={{
            fontSize: font.base, fontWeight: font.semibold, fontFamily: font.body,
            color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em",
          }}>
            {pageLabel}
          </span>
        )}
        {pendingCount > 0 && (
          <button
            onClick={onNavPending}
            className="btn-hover badge-pulse"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: `1px solid rgba(201,168,76,0.4)`,
              borderRadius: radius.full, padding: "5px 14px",
              fontSize: font.sm, fontWeight: font.bold,
              fontFamily: font.body,
              color: T.accent,
              cursor: "pointer",
              transition: transition.fast,
            }}
          >
            {pendingCount} Pending
          </button>
        )}
        {onBackToModules && (
          <button
            onClick={onBackToModules}
            className="btn-hover"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: radius.md,
              padding: "6px 14px",
              cursor: "pointer",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              transition: transition.fast,
              fontFamily: font.body,
            }}
          >
            Back to Modules
          </button>
        )}
      </div>
    </div>
  );
}
