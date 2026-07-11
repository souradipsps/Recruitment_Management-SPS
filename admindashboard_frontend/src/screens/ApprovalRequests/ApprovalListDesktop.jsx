import { T } from "../../theme";
import { statusVariant } from "../../theme";
import { Badge, Mono } from "../../components/ui";
import { CATEGORY_OPTIONS } from "../../data";

/**
 * Desktop table-row list of approval requests.
 * Each row has quick Accept / Reject inline buttons for Pending items.
 */
export default function ApprovalListDesktop({ filtered, openModal, performAction }) {
  return (
    <div>
      {filtered.map((r) => (
        <div
          /* Key on the unique backend pk, not r.id (= request_id): a request can
             be sent back multiple times, leaving several Sent Back approvals that
             share one request_id. Using r.id there caused duplicate React keys,
             which broke the Sent Back filter's rendering. */
          key={r.backendId ?? r.id}
          onClick={() => openModal(r)}
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.primaryPale; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {/* Left: meta info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <Mono v={String(r.sourceId).substring(0, 16)} />
              <Badge label={r.type || "Request"} variant="blue" />
              <Badge label={r.status} variant={statusVariant(r.status)} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{r.role}</div>
            <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
              {r.dept && r.dept !== "N/A" ? `${r.dept} · ` : ""}
              {r.category ? `${CATEGORY_OPTIONS.find((c) => c.value === r.category)?.label || r.category} · ` : ""}
              {r.requestedBy} · {r.date}
            </div>
            {r.comment && (
              <div style={{
                marginTop: 6, fontSize: 12, color: T.amber,
                background: T.amberLight, padding: "3px 8px",
                borderRadius: 6, display: "inline-block",
                border: `1px solid #FDE68A`,
              }}>
                {r.comment}
              </div>
            )}
          </div>

          {/* Right: quick-action buttons (Pending only) */}
          {r.status === "Pending" && (
            <div
              style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); performAction(r, "Approved"); }}
                style={{
                  background: T.greenLight, color: T.green, border: `1.5px solid #A7F3D0`,
                  borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.greenLight; e.currentTarget.style.color = T.green; }}
              >
                ✓ Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); performAction(r, "Rejected"); }}
                style={{
                  background: T.redLight, color: T.red, border: `1.5px solid #FECACA`,
                  borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.red; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
