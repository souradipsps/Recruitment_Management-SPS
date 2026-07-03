import { T } from "../../theme";

export default function JobRequestStatusFilter({ statuses, counts, statusFilter, setStatusFilter }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
      {statuses.map((status) => {
        const count = counts[status];
        const isActive = statusFilter === status;
        return (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              background: isActive ? T.primary : T.white,
              color: isActive ? "#fff" : T.ink,
              border: `1.5px solid ${isActive ? T.primary : T.border}`,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {status}
            <span
              style={{
                background: isActive ? "rgba(255,255,255,0.25)" : T.border,
                color: isActive ? "#fff" : T.inkMid,
                borderRadius: 99,
                padding: "1px 6px",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
