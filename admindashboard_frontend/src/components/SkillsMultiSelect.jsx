import { useState, useRef, useEffect } from "react";
import { T } from "../theme";

const ALL_SKILLS_DEFAULT = [
  "Curriculum Development", "Classroom Management", "Student Assessment",
  "Communication", "Leadership", "Team Collaboration", "Microsoft Office",
  "Data Analysis", "Project Management", "Problem Solving",
  "CBSE Curriculum", "Digital Literacy", "Research & Development",
  "Counselling", "Event Management", "Administration", "IT Support",
  "Sports Coaching", "Content Creation", "Public Speaking",
];

export default function SkillsMultiSelect({ options = ALL_SKILLS_DEFAULT, selected = [], onChange, placeholder = "Select or add skills…" }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed]);
    setCustom("");
  };

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: `1.5px solid ${open ? T.primary : T.border}`,
          borderRadius: 8,
          padding: "8px 32px 8px 10px",
          fontSize: 13,
          minHeight: 40,
          boxSizing: "border-box",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          alignItems: "center",
          background: "#fff",
          position: "relative",
          transition: "border-color 0.15s",
        }}
      >
        {selected.length === 0 && (
          <span style={{ color: T.inkFaint, fontSize: 13 }}>{placeholder}</span>
        )}
        {selected.map((s) => (
          <span
            key={s}
            onClick={(e) => { e.stopPropagation(); toggle(s); }}
            style={{
              background: T.primaryLight || "#EDE9FE",
              color: T.primary,
              padding: "3px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s",
            }}
          >
            {s} ×
          </span>
        ))}
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            fontSize: 10,
            color: T.inkMid,
            transition: "transform 0.2s",
            pointerEvents: "none",
          }}
        >▼</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 100,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {/* Custom input row */}
          <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add custom…"
              style={{
                flex: 1,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "5px 8px",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={addCustom}
              style={{
                background: T.primary,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >Add</button>
          </div>

          {/* Option list */}
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: isSelected ? (T.primaryLight || "#EDE9FE") : "transparent",
                  color: isSelected ? T.primary : T.ink,
                  fontWeight: isSelected ? 600 : 400,
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.canvas; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                {opt}
                {isSelected && <span style={{ fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
