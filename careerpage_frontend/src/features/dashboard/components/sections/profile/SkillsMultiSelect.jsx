import React, { useState } from "react";
import { MAROON, ALL_SKILLS } from "../../../data/dashboardMockData";

export function SkillsMultiSelect({ selected, onChange, placeholder = "Select or add items…" }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const toggle = (opt) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustom("");
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          minHeight: "42px",
          padding: "8px 32px 8px 12px",
          border: "1.5px solid #e5e7eb",
          borderRadius: "8px",
          background: "#faf8f5",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          position: "relative",
        }}
      >
        {selected.length === 0 && (
          <span style={{ color: "#9ca3af", fontSize: "0.85rem", alignSelf: "center" }}>
            {placeholder}
          </span>
        )}
        {selected.map((s) => (
          <span
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              toggle(s);
            }}
            style={{
              background: `rgba(114,16,42,0.1)`,
              color: MAROON,
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "999px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {s} &times;
          </span>
        ))}
        <span
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: "transform 0.2s",
            color: "#6b5c5c",
            fontSize: "0.75rem",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            zIndex: 100,
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: "6px" }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add custom item…"
              style={{
                flex: 1,
                padding: "6px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              onClick={addCustom}
              style={{
                background: MAROON,
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.78rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Add
            </button>
          </div>
          {ALL_SKILLS.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                padding: "9px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                color: selected.includes(opt) ? MAROON : "#1a0a0a",
                background: selected.includes(opt) ? "rgba(114,16,42,0.05)" : "transparent",
                fontWeight: selected.includes(opt) ? 600 : 400,
              }}
            >
              {opt}
              {selected.includes(opt) && <span style={{ color: MAROON }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
