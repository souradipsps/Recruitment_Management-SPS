import { T, font, radius, transition } from "../theme";
import { NAV } from "../data";

// Sidebar navigation + user profile footer.
// Rendered inside both the desktop rail and the mobile overlay in App.
export default function Sidebar({ active, currentUser, pendingCount, onNav, onLogout }) {
  const items = NAV.filter((item) =>
    currentUser?.role !== "admin" ? item.id === "panelist" : true,
  );

  return (
    <>
      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "24px 10px 12px" }}>
        {items.map((item, idx) => {
          const isActive = active === item.id;
          const itemPending = item.id === "approval-requests" ? pendingCount : 0;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`sidebar-item ${isActive ? "active" : ""} animate-slide-in`}
              style={{
                display: "flex", alignItems: "center", gap: 11, width: "100%",
                padding: "10px 14px", borderRadius: radius.md + 1, border: "none",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: "#fff",
                fontWeight: isActive ? font.bold : font.medium,
                fontSize: font.base,
                fontFamily: font.body,
                cursor: "pointer", textAlign: "left",
                marginBottom: 2,
                letterSpacing: "-0.01em",
                animationDelay: `${idx * 0.03}s`,
              }}
            >
              <span style={{
                fontSize: font.md,
                opacity: isActive ? 1 : 0.7,
                transition: transition.fast,
                transform: isActive ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
              }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {itemPending > 0 && (
                <span
                  className="badge-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
                    color: "#fff", borderRadius: radius.full,
                    padding: "2px 8px", fontSize: font.xs, fontWeight: font.extrabold,
                    minWidth: 20, textAlign: "center",
                  }}
                >
                  {itemPending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: font.sm,
                fontWeight: font.bold,
                fontFamily: font.body,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            >
              {currentUser?.name ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "HR"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.name || "HR Admin"}
              </div>
              <div style={{ fontSize: font.xs, fontFamily: font.body, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.email || "hr@southpoint.edu"}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: radius.md,
              padding: "4px 8px",
              cursor: "pointer",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: font.body,
              transition: "background 0.2s",
            }}
            className="btn-hover"
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
