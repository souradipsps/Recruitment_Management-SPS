import { useState } from "react";
import { T, font } from "../../theme";
import { STATUS_COLORS } from "../../theme";
import { Modal, ModalHeader, Btn } from "../../components/ui";

export default function RoleDetailsModal({ sel, setSel, onClose, onStatusChange, onDelete, onRequestRevision, onAddVariation, bp, roles = [] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const currentSelId = sel?.id ?? null;
  const [lastSelId, setLastSelId] = useState(currentSelId);

  if (currentSelId !== lastSelId) {
    setLastSelId(currentSelId);
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  if (!sel) return null;
  const sc = STATUS_COLORS[sel.currentStatus] || STATUS_COLORS.Active;
  const siblingRoles = roles.filter((r) => r.role === sel.role && r.dept === sel.dept);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRequestRevisionClick = () => {
    if (selectMode && selectedIds.size > 0) {
      const chosen = siblingRoles.filter((r) => selectedIds.has(r.id));
      onRequestRevision?.(chosen);
    } else {
      onRequestRevision?.(sel);
    }
    onClose();
  };

  const handleAddVariationClick = () => {
    onAddVariation?.({ dept: sel.dept, role: sel.role, backendId: sel.backendId });
    onClose();
  };

  return (
    <Modal open={!!sel} onClose={onClose} maxWidth={520}>
      <div>
        <ModalHeader title="Role Details" onClose={onClose} />

        <div style={{
          background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
          margin: bp === "mobile" ? "-4px -16px 20px" : "-4px -24px 20px",
          padding: bp === "mobile" ? "18px 20px" : "24px 28px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}>
            💼
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              {sel.dept}
            </div>
            <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sel.role}
            </h3>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: bp === "mobile" ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Role ID", value: <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{sel.id}</span> },
            { label: "Department", value: sel.dept }
          ].map((item, idx) => (
            <div key={idx} style={{
              padding: 10, background: T.canvas, border: `1px solid ${T.border}`,
              borderRadius: 8, display: "flex", flexDirection: "column", gap: 3
            }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.label}
              </span>
              <div style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Variations List */}
        <div style={{
          padding: 14, background: T.canvas, border: `1px solid ${T.border}`,
          borderRadius: 8, display: "flex", flexDirection: "column", gap: 10, marginBottom: 12
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Variations (Type, Experience, Salary)
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!selectMode && (
                <button
                  onClick={handleAddVariationClick}
                  style={{
                    background: "transparent",
                    color: T.primary,
                    border: `1.5px solid ${T.primary}`,
                    borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Add Variation
                </button>
              )}
              {siblingRoles.length > 1 && (
                <button
                  onClick={() => {
                    setSelectMode((prev) => !prev);
                    setSelectedIds(new Set());
                  }}
                  style={{
                    background: selectMode ? T.primary : "transparent",
                    color: selectMode ? "#fff" : T.primary,
                    border: `1.5px solid ${T.primary}`,
                    borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {selectMode ? "Cancel" : "Select"}
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {siblingRoles.map((r, idx) => (
              <div key={r.id || idx} style={{
                fontSize: 12.5, fontWeight: 600, color: T.ink,
                padding: "10px 14px", background: selectMode && selectedIds.has(r.id) ? T.canvas : T.surface, borderRadius: 8,
                border: `1px solid ${selectMode && selectedIds.has(r.id) ? T.primary : T.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap"
              }}>
                <div style={{ flex: 1, minWidth: 150, display: "flex", alignItems: "center", gap: 10 }}>
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelected(r.id)}
                      style={{ width: 15, height: 15, cursor: "pointer", flexShrink: 0 }}
                    />
                  )}
                  <span>
                    • <strong>{r.type || "Full-time"}</strong> ({r.experience ? `${r.experience} yrs` : "—"}) : {r.salaryRange ? `₹${r.salaryRange}` : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={r.currentStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      onStatusChange(r.id, val);
                      if (r.id === sel.id) {
                        setSel((prev) => prev ? { ...prev, currentStatus: val } : null);
                      }
                    }}
                    style={{
                      background: r.currentStatus === "Active" ? T.greenLight : T.canvas,
                      color: r.currentStatus === "Active" ? T.green : T.inkLight,
                      border: `1.5px solid ${r.currentStatus === "Active" ? "#34D399" : T.border}`,
                      borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700,
                      cursor: "pointer", outline: "none"
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <button
                    onClick={() => {
                      onDelete(r.id);
                      if (r.id === sel.id) onClose();
                    }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: T.red, fontWeight: 700, fontSize: 11, padding: "4px 8px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          {selectMode && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.inkFaint, marginRight: "auto" }}>
              {selectedIds.size > 0
                ? `${selectedIds.size} variation${selectedIds.size !== 1 ? "s" : ""} selected`
                : "Select variations to update together"}
            </span>
          )}
          <Btn
            label="Request Revision"
            onClick={handleRequestRevisionClick}
          />
          <Btn
            label="Delete Role"
            variant="danger"
            onClick={() => {
              onDelete(sel.id);
              onClose();
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
