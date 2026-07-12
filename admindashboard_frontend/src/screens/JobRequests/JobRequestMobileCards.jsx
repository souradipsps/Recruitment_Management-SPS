import { T } from "../../theme";
import { statusVariant } from "../../theme";
import { Badge } from "../../components/ui";

export default function JobRequestMobileCards({ filteredRequests, onView, scrollRef, currentCardIndex, setCurrentCardIndex }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
        {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const cardWidth = e.currentTarget.clientWidth;
          const newIndex = Math.round(scrollLeft / cardWidth);
          setCurrentCardIndex(newIndex);
        }}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          gap: 16,
          padding: "0 16px 20px",
          margin: "0 -16px",
        }}
      >
        {filteredRequests.map((r, idx) => {
          const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
          return (
            <div
              key={r.id}
              onClick={() => onView(r)}
              style={{
                flexShrink: 0,
                minWidth: "calc(100% - 32px)",
                scrollSnapAlign: "center",
                borderRadius: 20,
                background: cardBackground,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 24,
                position: "relative",
                boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                cursor: "pointer",
                minHeight: 380,
              }}
            >
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                {idx + 1} of {filteredRequests.length}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}
                  >
                    💼
                  </div>
                  <div style={{ paddingRight: 64 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role}</h3>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                      {r.department ? `${r.department} · ` : ""}{r.location || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 16,
                  flex: 1,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Request ID</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Vacancies</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.vacancies || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Experience</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.exp || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Type</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.type || "—"}</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Salary</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{r.salary || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700, textAlign: "right" }}>Status</div>
                      <div style={{ marginTop: 2, textAlign: "right" }}>
                        <Badge label={r.status} variant={statusVariant(r.status)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequests.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
          {filteredRequests.map((_, i) => (
            <div
              key={i}
              onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })}
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
    </div>
  );
}
