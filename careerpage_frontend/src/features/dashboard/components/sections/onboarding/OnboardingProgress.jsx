import React from "react";
import { CheckCircle, ClipboardCheck } from "lucide-react";
import { MAROON } from "../../../data/dashboardMockData";

export function OnboardingProgress({ steps }) {
  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <ClipboardCheck size={16} color={MAROON} />
        <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>Onboarding Progress</h2>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a" }}>Overall Progress</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: MAROON }}>{pct}%</span>
          </div>
          <div style={{ background: "#f0f0f0", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
            <div
              style={{
                background: MAROON,
                width: `${pct}%`,
                height: "100%",
                borderRadius: "999px",
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>

        {steps.map(({ label, done, desc }, idx) => (
          <div
            key={label}
            style={{
              display: "flex",
              gap: "12px",
              padding: "10px 0",
              borderBottom: idx < steps.length - 1 ? "1px solid #f9f9f9" : "none",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: `2px solid ${done ? "#065f46" : "#d1d5db"}`,
                  background: done ? "#065f46" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <CheckCircle size={12} color="#fff" />
                ) : (
                  <span style={{ fontSize: "0.6rem", color: "#9ca3af", fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: "2px",
                    flex: 1,
                    background: done ? "#065f46" : "#e5e7eb",
                    minHeight: "12px",
                  }}
                />
              )}
            </div>
            <div style={{ paddingBottom: "8px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: done ? "#065f46" : "#1a0a0a" }}>
                {label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9a8a8a", marginTop: "2px" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
