import { useState } from "react";
import { T } from "../../theme";
import { useBreakpoint } from "../../hooks";
import { Card, SectionTitle, Input, Select } from "../../components/ui";
import { patchRole } from "../../api/rolesApi";
import RoleCardGrid from "./RoleCardGrid";
import RolesTable from "./RolesTable";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function ExistingRoles({ roles, setRoles }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusError, setStatusError] = useState("");

  const depts = ["All", ...new Set(roles.map((r) => r.dept))];
  const statuses = ["All", "Active", "Inactive"];

  const handleStatusChange = async (roleId, newStatus) => {
    const target = roles.find((r) => r.id === roleId);
    if (target?.backendId != null) {
      try {
        await patchRole(target.backendId, { status: newStatus });
      } catch (err) {
        console.error("Failed to update role status:", err);
        setStatusError(err.message || "Failed to update status. Please try again.");
        return; // do NOT update local state if the API call failed
      }
    }
    setStatusError("");
    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId ? { ...role, currentStatus: newStatus } : role
      )
    );
  };

  const handleDeleteRole = (roleId) => {
    setDeleteConfirmId(roleId);
  };

  const filtered = roles
    .filter((r) => deptFilter === "All" || r.dept === deptFilter)
    .filter((r) => statusFilter === "All" || r.currentStatus === statusFilter)
    .filter(
      (r) =>
        r.role.toLowerCase().includes(search.toLowerCase()) ||
        r.dept.toLowerCase().includes(search.toLowerCase()) ||
        String(r.id).toLowerCase().includes(search.toLowerCase())
    );

  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.currentStatus === "Active").length;
  const inactiveRoles = roles.filter((r) => r.currentStatus !== "Active").length;

  return (
    <div>
      {statusError && (
        <div style={{
          marginBottom: 14, padding: "10px 16px",
          borderRadius: 8, background: "#FEE2E2",
          color: "#DC2626", fontSize: 13, fontWeight: 600,
          border: "1px solid #FCA5A5",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {statusError}
          <button
            onClick={() => setStatusError("")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#DC2626", fontWeight: 800, fontSize: 16, lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}

      <SectionTitle title="Existing Roles" sub="All sanctioned positions across departments" />

      {/* Card summary grid */}
      <RoleCardGrid
        totalRoles={totalRoles}
        activeRoles={activeRoles}
        inactiveRoles={inactiveRoles}
        isMobile={isMobile}
      />

      <Card>
        {/* Filters and Search */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            placeholder="Search roles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: isMobile ? "100%" : 240 }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto" }}>
            <div style={{ minWidth: isMobile ? "100%" : 220 }}>
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={depts.map((d) => ({ value: d, label: d }))}
                placeholder="All departments"
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    border: `1px solid ${statusFilter === s ? T.primary : T.border}`,
                    background: statusFilter === s ? T.primary : T.surface,
                    color: statusFilter === s ? "#fff" : T.ink,
                    borderRadius: 99,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 12, color: T.inkFaint, marginLeft: "auto" }}>{filtered.length} roles</span>
        </div>

        {/* Roles list/table */}
        <RolesTable
          cols={["Role ID", "Department", "Role Name", "Experience", "Salary Range", "Type", "Status", "Action"]}
          rows={filtered}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteRole}
          bp={bp}
        />
      </Card>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        deleteConfirmId={deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        roles={roles}
        setRoles={setRoles}
      />
    </div>
  );
}
