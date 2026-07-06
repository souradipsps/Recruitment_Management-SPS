import { T, font } from "../../theme";
import { STATUS_COLORS } from "../../theme";
import { Modal, ModalHeader, Btn } from "../../components/ui";

export default function RoleDetailsModal({ sel, setSel, onClose, onStatusChange, onDelete, bp }) {
  if (!sel) return null;
  const sc = STATUS_COLORS[sel.currentStatus] || STATUS_COLORS.Active;

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
              {sel.dept} · {sel.type}
            </div>
            <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sel.role}
            </h3>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "5px 14px",
            background: sel.currentStatus === "Active" ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.12)",
            color: sel.currentStatus === "Active" ? "#6EE7B7" : "rgba(255,255,255,0.7)",
            border: `1px solid ${sel.currentStatus === "Active" ? "rgba(110,231,183,0.35)" : "rgba(255,255,255,0.18)"}`,
            flexShrink: 0, letterSpacing: "0.02em",
          }}>
            {sel.currentStatus}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: bp === "mobile" ? "1fr" : "1fr 1fr", gap: 12 }}>
          {[
            { label: "Role ID", value: <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{sel.id}</span> },
            { label: "Department", value: sel.dept },
            { label: "Employment Type", value: sel.type },
            { label: "Work Experience Required", value: sel.experience ? `${sel.experience} years` : "No experience required" },
            { label: "Salary Budget (Annual)", value: <strong style={{ color: T.tealDark }}>{sel.salaryRange || "—"}</strong> },
            {
              label: "Status Toggle",
              value: (
                <select
                  value={sel.currentStatus}
                  onChange={(e) => {
                    const val = e.target.value;
                    onStatusChange(sel.id, val);
                    setSel((prev) => prev ? { ...prev, currentStatus: val } : null);
                  }}
                  style={{
                    background: sel.currentStatus === "Active" ? T.greenLight : T.canvas,
                    color: sel.currentStatus === "Active" ? T.green : T.inkLight,
                    border: `1.5px solid ${sel.currentStatus === "Active" ? "#34D399" : T.border}`,
                    borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer", outline: "none", width: "100%"
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              )
            }
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

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
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
