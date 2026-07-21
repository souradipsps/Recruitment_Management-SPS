import { Card, Table, Mono } from "../../components/ui";
import { getStatusStyle } from "./jobRequestUtils";
import { T } from "../../theme";

export default function JobRequestTable({ filteredRequests, onRowClick, totalPages, activePage, setCurrentPage }) {
  return (
    <Card>
      <Table
        onRowClick={onRowClick}
        cols={["Request ID", "Department", "Role", "Location", "Vacancies", "Experience", "Qualification", "Type", "Salary", "Status"]}
        rows={filteredRequests.map((r) => {
          const ss = getStatusStyle(r.status);
          return [
            <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
            r.department || "—",
            <strong>{r.role}</strong>,
            r.location || "—",
            r.vacancies || "—",
            r.exp || "—",
            (r.qual || []).join(", ") || "—",
            r.type || "—",
            r.salary || "—",
            <span style={{ ...ss, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{r.status}</span>,
          ];
        })}
      />

      {/* Desktop Pagination Control */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "16px 20px",
          borderTop: `1px solid ${T.border}`,
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={activePage === 1}
            style={{
              background: T.white,
              color: activePage === 1 ? T.inkFaint : T.primary,
              border: `1.5px solid ${activePage === 1 ? T.border : T.primary}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: activePage === 1 ? "not-allowed" : "pointer",
              opacity: activePage === 1 ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            &larr; Previous 20
          </button>

          <span style={{ fontSize: 13, color: T.inkMid, fontWeight: 600 }}>
            Page {activePage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={activePage === totalPages}
            style={{
              background: activePage === totalPages ? T.white : T.primary,
              color: activePage === totalPages ? T.inkFaint : T.white,
              border: `1.5px solid ${activePage === totalPages ? T.border : T.primary}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: activePage === totalPages ? "not-allowed" : "pointer",
              opacity: activePage === totalPages ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            Next 20 &rarr;
          </button>
        </div>
      )}
    </Card>
  );
}
