import { useState, useRef } from "react";
import { T } from "../../theme";
import { STATUS_COLORS } from "../../theme";
import { Table, Badge, Mono, Btn } from "../../components/ui";
import RoleDetailsModal from "./RoleDetailsModal";

export default function RolesTable({
  cols,
  rows,
  onStatusChange,
  onDelete,
  onRequestRevision,
  onAddVariation,
  bp,
}) {
  const [sel, setSel] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef(null);

  const avatar = (name, size = 48, fs = 16) => {
    const val = name || "RL";
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: fs, flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.25)"
      }}>
        {val.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
      </div>
    );
  };

  const open = (r) => setSel(r);
  const close = () => setSel(null);

  const renderRows = () => rows.map((r) => {
    const sc = STATUS_COLORS[r.currentStatus] || STATUS_COLORS.Active;
    return [
      <Mono v={r.id} />,
      <span style={{ fontSize: 12, color: T.inkMid }}>{r.dept}</span>,
      <strong style={{ color: T.ink }}>{r.role}</strong>,
      <span style={{ fontSize: 13, color: T.ink }}>{r.experience ? `${r.experience} yrs` : "—"}</span>,
      <span style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{r.salaryRange ? `₹${r.salaryRange}` : "—"}</span>,
      <Badge label={r.type} variant={r.type === "Full-time" ? "blue" : "teal"} />,
      <select
        value={r.currentStatus}
        onChange={(e) => onStatusChange(r.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`,
          borderRadius: 99, padding: "3px 24px 3px 10px", fontSize: 11, fontWeight: 700,
          cursor: "pointer", outline: "none", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='${encodeURIComponent(sc.color)}' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
        }}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>,
      <Btn
        label="Delete"
        variant="danger"
        small
        onClick={(e) => {
          e.stopPropagation();
          onDelete(r.id);
        }}
      />,
    ];
  });

  if (bp === "mobile") {
    return (
      <>
        <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
          {rows.length} role{rows.length !== 1 ? "s" : ""}
        </div>

        <div
          ref={scrollRef}
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const cardWidth = e.currentTarget.clientWidth;
            if (cardWidth > 0) {
              const newIndex = Math.round(scrollLeft / cardWidth);
              setCurrentCardIndex(newIndex);
            }
          }}
          className="carousel-scroll"
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: 12,
            paddingBottom: 20,
            margin: "0 -12px",
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          {rows.map((r, idx) => {
            const sc = STATUS_COLORS[r.currentStatus] || STATUS_COLORS.Active;
            return (
              <div
                key={r.id}
                onClick={() => open(r)}
                style={{
                  flexShrink: 0,
                  width: "calc(100% - 24px)",
                  scrollSnapAlign: "center",
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 24,
                  position: "relative",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                  minHeight: 350,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 12px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {idx + 1} of {rows.length}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 40 }}>
                    {avatar(r.role)}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role}</h3>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                        {r.dept}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 16,
                    flex: 1,
                  }}
                >
                  {[
                    { icon: "🆔", label: "Role ID", value: r.id },
                    { icon: "⏳", label: "Experience", value: r.experience ? `${r.experience} yrs` : "—" },
                    { icon: "💰", label: "Salary Range", value: r.salaryRange ? `₹${r.salaryRange}` : "—" },
                    { icon: "💼", label: "Type", value: r.type },
                  ].map((item, index) => (
                    <div key={index} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: "12px 0 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    marginTop: 12,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Status</span>
                    <select
                      value={r.currentStatus}
                      onChange={(e) => onStatusChange(r.id, e.target.value)}
                      style={{
                        backgroundColor: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`,
                        borderRadius: 99, padding: "3px 24px 3px 10px", fontSize: 11, fontWeight: 700,
                        cursor: "pointer", outline: "none", appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='${encodeURIComponent(sc.color)}' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <Btn
                    label="Delete"
                    variant="danger"
                    small
                    onClick={() => onDelete(r.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {rows.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
            {rows.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" });
                  }
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: currentCardIndex === i ? T.primary : T.border,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        )}

        <RoleDetailsModal sel={sel} setSel={setSel} onClose={close} onStatusChange={onStatusChange} onDelete={onDelete} onRequestRevision={onRequestRevision} onAddVariation={onAddVariation} bp={bp} roles={rows} />
      </>
    );
  }

  return (
    <>
      <Table
        cols={cols}
        rows={renderRows()}
        onRowClick={(i) => open(rows[i])}
      />
      <RoleDetailsModal sel={sel} setSel={setSel} onClose={close} onStatusChange={onStatusChange} onDelete={onDelete} onRequestRevision={onRequestRevision} onAddVariation={onAddVariation} bp={bp} roles={rows} />
    </>
  );
}
