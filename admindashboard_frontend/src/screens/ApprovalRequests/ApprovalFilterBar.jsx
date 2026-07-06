import { T } from "../../theme";
import { Input } from "../../components/ui";

/**
 * Search bar + status filter dropdown + pending count badge.
 */
export default function ApprovalFilterBar({ search, setSearch, statusFilter, setStatusFilter, pendingCount, isMobile }) {
  return (
    <div style={{
      padding: "14px 16px",
      borderBottom: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      alignItems: isMobile ? "stretch" : "center",
    }}>
      <Input
        placeholder="Search id, dept, role, user, date…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={isMobile ? { width: "100%" } : { flex: 1, minWidth: 200, maxWidth: 300 }}
      />
      <div style={{
        display: "flex", gap: 10, alignItems: "center",
        justifyContent: "space-between",
        width: isMobile ? "100%" : "auto",
        marginLeft: isMobile ? 0 : "auto",
      }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            border: `1.5px solid ${T.border}`, borderRadius: 8,
            padding: "8px 12px", fontSize: 13, color: T.inkMid,
            background: "#fff", cursor: "pointer",
            flex: isMobile ? 1 : "none",
          }}
        >
          {["All", "Pending", "Approved", "Rejected", "Sent Back"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {pendingCount > 0 && (
          <span style={{
            background: T.amberLight, border: `1px solid #FDE68A`,
            borderRadius: 99, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, color: T.amber, whiteSpace: "nowrap",
          }}>
            {pendingCount} pending
          </span>
        )}
      </div>
    </div>
  );
}
