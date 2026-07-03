import { Card, Table, Mono } from "../../components/ui";
import { getStatusStyle } from "./jobRequestUtils";

export default function JobRequestTable({ filteredRequests, onRowClick }) {
  return (
    <Card>
      <Table
        onRowClick={onRowClick}
        cols={["Request ID", "Role", "Location", "Vacancies", "Experience", "Qualification", "Type", "Salary", "Status"]}
        rows={filteredRequests.map((r) => {
          const ss = getStatusStyle(r.status);
          return [
            <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
            <strong>{r.role}</strong>,
            r.location || "—",
            r.vacancies || "—",
            r.exp || "—",
            r.qual || "—",
            r.type || "—",
            r.salary || "—",
            <span style={{ ...ss, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{r.status}</span>,
          ];
        })}
      />
    </Card>
  );
}
