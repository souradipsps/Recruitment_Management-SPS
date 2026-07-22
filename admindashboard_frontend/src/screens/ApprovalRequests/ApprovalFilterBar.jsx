import { useState } from "react";
import { T } from "../../theme";
import { Input } from "../../components/ui";

/**
 * Individual dropdown option.
 * Uses onMouseDown with preventDefault so selection fires instantly
 * without triggering a blur on the container (which would close the menu).
 */
function Option({ label, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: isSelected ? 700 : 500,
        color: isSelected ? T.primary : T.inkMid,
        background: isSelected
          ? T.primaryPale
          : hovered
            ? "#f3f4f6"
            : "transparent",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}

/**
 * Custom React dropdown.
 * Uses the browser's focus/blur system for outside-click detection —
 * no backdrop div, no z-index conflicts, no event timing races.
 */
function CustomSelect({ value, onChange, options, isMobile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const selected = options.find((o) => o.value === value) || options[0] || { label: "", value: "" };

  return (
    <div
      /* tabIndex makes the container focusable so onBlur fires
         when the user clicks anywhere outside it. */
      tabIndex={-1}
      onBlur={(e) => {
        /* React's onBlur is actually focusout (bubbles).
           Only close if focus moved OUTSIDE this container. */
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
      style={{
        position: "relative",
        flex: isMobile ? 1 : "none",
        minWidth: isMobile ? "100%" : 150,
        outline: "none",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "100%",
          border: `1.5px solid ${isOpen || isHovered ? T.primary : T.border}`,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: T.inkMid,
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: isOpen || isHovered 
            ? `0 0 0 3px ${T.primary}1A` 
            : "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected.label}
        </span>
        <span style={{
          fontSize: 8,
          color: T.inkFaint,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease-in-out",
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            zIndex: 100,
            padding: "4px 0",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <Option
                key={opt.value}
                label={opt.label}
                isSelected={isSelected}
                onSelect={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Search bar + status filter dropdown + pending count badge.
 */
export default function ApprovalFilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  pendingCount,
  isMobile,
}) {
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
        placeholder="Search by role, department, user…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={isMobile ? { width: "100%" } : { flex: 1, minWidth: 200, maxWidth: 300 }}
      />
      <div style={{
        display: "flex", gap: 10, alignItems: "center",
        justifyContent: "space-between",
        width: isMobile ? "100%" : "auto",
        marginLeft: isMobile ? 0 : "auto",
        flexWrap: "wrap",
      }}>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          isMobile={isMobile}
          options={[
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
            { value: "Sent Back", label: "Sent Back" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
        />

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          {[
            { value: "All", label: "All Types" },
            { value: "Role Request", label: "Role Request" },
            { value: "Job Request", label: "Job Request" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeFilter(t.value)}
              style={{
                flex: isMobile ? 1 : "none",
                border: `1.5px solid ${typeFilter === t.value ? T.primary : T.border}`,
                background: typeFilter === t.value ? T.primary : "#fff",
                color: typeFilter === t.value ? "#fff" : T.inkMid,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                boxShadow: typeFilter === t.value ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (typeFilter !== t.value) {
                  e.currentTarget.style.borderColor = T.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primary}1A`;
                }
              }}
              onMouseLeave={(e) => {
                if (typeFilter !== t.value) {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

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
