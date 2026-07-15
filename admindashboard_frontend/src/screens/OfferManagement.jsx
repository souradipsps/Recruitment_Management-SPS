import { useState, useRef } from "react";
import { T, font } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint, useHorizontalScroll } from "../hooks";
import { Card, SectionTitle, Table, Mono, Badge, Btn, Modal, ModalHeader, FormField, Input } from "../components/ui";
import { EXISTING_ROLES } from "../data";
import { createOffer, updateOffer } from "../api/offersApi";

// Interview score for an offer's candidate — the panel's average from that
// candidate's FINAL round (highest round number), not just whichever interview
// record happens to come first in the API response.
const getInterviewScore = (interviews, candidate, role) => {
  const matches = interviews.filter((inv) => inv.candidate === candidate && inv.role === role);
  if (matches.length === 0) return null;
  const finalRound = matches.reduce((latest, inv) => (inv.round > latest.round ? inv : latest), matches[0]);
  return finalRound?.evaluationSummary?.average_score ?? null;
};

const getRoundOrdinal = (round) => {
  if (round === 1) return "1st Round";
  if (round === 2) return "2nd Round";
  if (round === 3) return "3rd Round";
  return `${round}th Round`;
};

export default function OfferManagement({ offers, setOffers, jobPostings = [], interviews = [], panelists = [] }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [viewOffer, setViewOffer] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ candidate: "", role: "", ctc: "", expiry: "", joining: "" });
  const [genOfferId, setGenOfferId] = useState(null);
  const [genRange, setGenRange] = useState(null);
  const [genSubmitting, setGenSubmitting] = useState(false);
  const [selectedPostingId, setSelectedPostingId] = useState(null);
  const [selectedOfferForModal, setSelectedOfferForModal] = useState(null);
  const [historyCandidate, setHistoryCandidate] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filterActiveIndex, setFilterActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const formatDateAndTime = (dateStr, timeStr) => {
    if (!dateStr) return "—";
    try {
      const dateObj = new Date(dateStr);
      let formattedDate = "";
      let yearDigits = "";

      if (isNaN(dateObj.getTime())) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const d = new Date(year, month, day);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            yearDigits = String(year).slice(-2);
          }
        }
      } else {
        formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        yearDigits = String(dateObj.getFullYear()).slice(-2);
      }

      if (!formattedDate) {
        return `${dateStr}${timeStr ? ` · ${timeStr}` : ""}`;
      }

      const formattedTime = timeStr
        ? timeStr.replace(/^0/, "").replace(/:00\s*/, " ").trim()
        : "";

      return `${formattedDate}, ’${yearDigits}${formattedTime ? ` · ${formattedTime}` : ""}`;
    } catch (e) {
      return `${dateStr}${timeStr ? ` · ${timeStr}` : ""}`;
    }
  };

  const avatar = (name, size = 32, fontSize = 12) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: T.primaryLight,
        color: T.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name.split(" ").map((n) => n[0]).join("")}
    </div>
  );

  const hScroll = useHorizontalScroll();
  const accentColor = T.blue;
  const accentPale = T.bluePale;

  const statusColors = {
    Draft: T.inkFaint,
    Sent: T.blue,
    Accepted: T.green,
    Rejected: T.red,
    Expired: T.amber,
  };

  const enrichedPostings = jobPostings.map((p) => ({
    ...p,
    offerCount: offers.filter((o) => o.role === p.role).length,
  }));

  const selectedRole = enrichedPostings.find((p) => p.id === selectedPostingId)?.role ?? null;

  const filteredOffers = selectedPostingId
    ? offers.filter((o) => o.role === selectedRole)
    : offers;

  const counts = ["Draft", "Sent", "Accepted", "Rejected", "Expired"].reduce((acc, s) => {
    acc[s] = filteredOffers.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const parseSalaryRange = (salaryRange) => {
    const trimmed = salaryRange.replace(/[₹, ]/g, "");
    const parts = trimmed.split("-").map((part) => parseInt(part, 10)).filter((v) => !Number.isNaN(v));
    if (parts.length !== 2) return null;
    return { min: parts[0], max: parts[1], label: `₹${parts[0].toLocaleString()} - ₹${parts[1].toLocaleString()}` };
  };

  const getRoleRange = (role) => {
    const roleDef = EXISTING_ROLES.find((r) => r.role === role || (r.role && r.role.toLowerCase() === role.toLowerCase()));
    return roleDef?.salaryRange ? parseSalaryRange(roleDef.salaryRange) : null;
  };

  const scrollCarousel = (dir) => {
    hScroll.ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const selectPosting = (id) => {
    setSelectedPostingId(id);
  };

  return (
    <div>
      <style>{`
        .btn-view-history {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #72102a;
          background: rgba(114, 16, 42, 0.06);
          border: 1px solid rgba(114, 16, 42, 0.18);
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .btn-view-history:hover {
          background: #72102a;
          color: #fff;
          border-color: #72102a;
          transform: translateY(-1.5px);
          box-shadow: 0 4px 12px rgba(114, 16, 42, 0.25);
        }
        .btn-view-history:active {
          transform: translateY(0);
        }
      `}</style>
      <SectionTitle title="Offer Management" sub="Review generated offers and track status end-to-end" />

      {enrichedPostings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedPostingId ? (
                <span>
                  Filtering by <span style={{ color: accentColor }}>{selectedRole}</span>
                  <button onClick={() => { selectPosting(null); setFilterActiveIndex(0); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[0]) cards[0].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }} style={{ marginLeft: 8, fontSize: 11, color: T.inkFaint, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>Clear ×</button>
                </span>
              ) : (
                <span style={{ color: T.inkFaint }}>Select a job to filter offers</span>
              )}
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => scrollCarousel("left")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => scrollCarousel("right")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </div>
            )}
          </div>

          {isMobile ? (
            <>
              <div
                ref={hScroll.ref}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const cardWidth = e.currentTarget.clientWidth;
                  if (cardWidth > 0) { const newIndex = Math.round(scrollLeft / cardWidth); setFilterActiveIndex(newIndex); }
                }}
                style={{ display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", gap: 12, paddingBottom: 4 }}
              >
                <div
                  onClick={() => { selectPosting(null); setFilterActiveIndex(0); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[0]) cards[0].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }}
                  style={{ flexShrink: 0, width: "100%", border: `2px solid ${!selectedPostingId ? accentColor : T.borderMid}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", background: !selectedPostingId ? accentPale : T.surface, display: "flex", flexDirection: "row", alignItems: "center", gap: 16, transition: "all 0.2s", boxShadow: !selectedPostingId ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: !selectedPostingId ? accentColor : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>◈</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink }}>All Offers</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{offers.length} total offers</div>
                  </div>
                  {!selectedPostingId && <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>}
                </div>

                {enrichedPostings.map((p, idx) => {
                  const isSelected = selectedPostingId === p.id;
                  const initials = p.role.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                  return (
                    <div key={p.id} onClick={() => { selectPosting(p.id); setFilterActiveIndex(idx + 1); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[idx + 1]) cards[idx + 1].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }} style={{ flexShrink: 0, width: "100%", border: `2px solid ${isSelected ? accentColor : T.borderMid}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", background: isSelected ? accentPale : T.surface, transition: "all 0.2s", boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: isSelected ? accentColor : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: isSelected ? "#fff" : T.inkMid }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.role}</div>
                          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{p.channel} Posting</div>
                        </div>
                        {isSelected && <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700, background: p.type === "Full-time" ? T.blueLight : T.tealLight, color: p.type === "Full-time" ? T.blue : T.teal }}>{p.type}</span>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? accentColor : T.ink }}>{p.offerCount}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>offers</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {[null, ...enrichedPostings.map((p) => p.id)].map((id, i) => (
                  <div key={i} onClick={() => { if (id === null) selectPosting(null); else selectPosting(id); setFilterActiveIndex(i); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[i]) cards[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }} style={{ width: filterActiveIndex === i ? 20 : 6, height: 6, borderRadius: 99, background: filterActiveIndex === i ? accentColor : T.border, cursor: "pointer", transition: "all 0.2s" }} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 8, width: 40, zIndex: 2, background: `linear-gradient(to right, ${T.canvas}, transparent)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 8, width: 40, zIndex: 2, background: `linear-gradient(to left, ${T.canvas}, transparent)`, pointerEvents: "none" }} />
              <div ref={hScroll.ref} className="carousel-scroll hscroll-track" onWheel={hScroll.onWheel} onMouseDown={hScroll.onMouseDown} onMouseMove={hScroll.onMouseMove} onMouseUp={hScroll.onMouseUp} onMouseLeave={hScroll.onMouseLeave} style={{ display: "flex", gap: 14, overflowX: "auto", padding: "12px 24px 16px 24px", WebkitOverflowScrolling: "touch", cursor: "grab", userSelect: "none" }}>
                <div onClick={() => selectPosting(null)} style={{ flexShrink: 0, width: 200, border: `2px solid ${!selectedPostingId ? accentColor : T.borderMid}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", background: !selectedPostingId ? accentPale : T.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s", minHeight: 140 }}>
                  <div style={{ fontSize: 24, opacity: 0.5 }}>◈</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink, textAlign: "center" }}>All Offers</div>
                  <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>{offers.length} offers</div>
                </div>

                {enrichedPostings.map((p) => {
                  const isSelected = selectedPostingId === p.id;
                  return (
                    <div key={p.id} onClick={() => selectPosting(p.id)} style={{ flexShrink: 0, width: 280, border: `2px solid ${isSelected ? accentColor : T.borderMid}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", background: isSelected ? accentPale : T.surface, transition: "all 0.18s", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 140, boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, flex: 1 }}>{p.role}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", background: p.type === "Full-time" ? T.blueLight : T.tealLight, color: p.type === "Full-time" ? T.blue : T.teal }}>{p.type}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.inkLight }}>{p.channel} Posting</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.offerCount}</strong> offers</span>
                        {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: accentColor, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {Object.entries(counts).map(([s, n], idx) => (
          <div key={s} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <Card style={{ padding: "12px 14px", textAlign: "center", borderTop: `3px solid ${statusColors[s]}` }}>
              <div className="animate-count-up" style={{ fontSize: isMobile ? font['2xl'] : font['3xl'], fontWeight: font.black, fontFamily: font.heading, color: statusColors[s], animationDelay: `${idx * 0.05 + 0.1}s` }}>{n}</div>
              <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: T.inkMid, marginTop: 4 }}>{s}</div>
            </Card>
          </div>
        ))}
      </div>

      {isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {filteredOffers.length} of {offers.length} offers
          </div>

          <div ref={scrollRef} onScroll={(e) => { const scrollLeft = e.currentTarget.scrollLeft; const cardWidth = e.currentTarget.clientWidth; const newIndex = Math.round(scrollLeft / cardWidth); setCurrentCardIndex(newIndex); }} style={{ display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", gap: 16, padding: "0 16px 20px", margin: "0 -16px" }}>
            {filteredOffers.map((o, idx) => {
              const score = getInterviewScore(interviews, o.candidate, o.role);
              const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
              return (
                <div key={o.id} onClick={() => setSelectedOfferForModal(o)} style={{ flexShrink: 0, minWidth: "calc(100% - 32px)", borderRadius: 20, background: cardBackground, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24, position: "relative", boxShadow: "0 14px 40px rgba(0,0,0,0.25)", cursor: "pointer", minHeight: 380 }}>
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>{idx + 1} of {filteredOffers.length}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>📄</div>
                      <div style={{ paddingRight: 64 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{o.candidate}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{o.role || "—"}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 18, border: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: 12, marginTop: 16, flex: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Offer ID</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.id}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 4 }}>Interview Score</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                          {score !== null ? (
                            <span style={{
                              fontSize: 11, fontWeight: 800,
                              background: score >= 80 ? T.greenLight : score >= 60 ? T.amberLight : T.redLight,
                              color: score >= 80 ? T.green : score >= 60 ? T.amber : T.red,
                              border: `1px solid ${score >= 80 ? "#A7F3D0" : score >= 60 ? "#FDE68A" : "#FCA5A5"}`,
                              padding: "3px 8px", borderRadius: 6,
                              display: "inline-flex", alignItems: "center", gap: 3
                            }}>
                              ★ {score}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>—</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryCandidate({ candidate: o.candidate, role: o.role });
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#fff",
                              background: "rgba(255,255,255,0.2)",
                              border: "1px solid rgba(255,255,255,0.3)",
                              borderRadius: 6,
                              padding: "2px 8px",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            📊 View
                          </button>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>CTC</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.ctc || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Joining Date</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.joining || "—"}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div />
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700, textAlign: "right" }}>Status</div>
                          <div style={{ marginTop: 2, textAlign: "right" }}><Badge label={o.status} variant={statusVariant(o.status)} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "flex-end", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setGenForm({ candidate: o.candidate, role: o.role, ctc: "", expiry: "", joining: "" }); setGenOfferId(o.backendId ?? null); setGenRange(getRoleRange(o.role)); setShowGenerateModal(true); }} style={{ border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Generate Offer</button>
                    {o.ctc && o.issued && o.expiry ? (
                      <button onClick={() => setViewOffer(o)} style={{ border: "none", background: "#fff", color: T.primary, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>View Letter</button>
                    ) : (
                      <button disabled style={{ border: "none", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 8, padding: "8px 14px", cursor: "not-allowed", fontWeight: 700, fontSize: 12 }}>View Letter</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOffers.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
              {filteredOffers.map((_, i) => (
                <div key={i} onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })} style={{ width: 8, height: 8, borderRadius: "50%", background: currentCardIndex === i ? T.primary : T.border, cursor: "pointer", transition: "all 0.3s" }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, whiteSpace: "nowrap" }}>{filteredOffers.length} of {offers.length} offers</span>
          </div>
          <Table
            cols={["Offer ID", "Candidate", "Role", "Score", "Status", "Generate", "Actions"]}
            onRowClick={(i) => setSelectedOfferForModal(filteredOffers[i])}
            rows={filteredOffers.map((o) => {
              const interviewScore = getInterviewScore(interviews, o.candidate, o.role);
              const score = (
                <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setHistoryCandidate({ candidate: o.candidate, role: o.role });
                    }}
                    className="btn-view-history"
                  >
                    📊 View
                  </button>
                </div>
              );
              return [
                <Mono v={o.id} />,
                <strong style={{ color: T.ink }}>{o.candidate}</strong>,
                o.role,
                score,
                <Badge label={o.status} variant={statusVariant(o.status)} />,
                <div onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setGenForm({ candidate: o.candidate, role: o.role, ctc: "", expiry: "", joining: "" }); setGenOfferId(o.backendId ?? null); setGenRange(getRoleRange(o.role)); setShowGenerateModal(true); }} style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Generate Offer</button>
                </div>,
                <div onClick={(e) => e.stopPropagation()}>
                  {o.ctc && o.issued && o.expiry ? (
                    <button onClick={() => setViewOffer(o)} style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>View Letter</button>
                  ) : (
                    <button disabled style={{ border: "none", background: "#E5E7EB", color: "#9CA3AF", borderRadius: 8, padding: "6px 12px", cursor: "not-allowed", fontWeight: 700, fontSize: 12, opacity: 0.6 }}>View Letter</button>
                  )}
                </div>,
              ];
            })}
          />
        </Card>
      )}

      <Modal open={!!selectedOfferForModal} onClose={() => setSelectedOfferForModal(null)} maxWidth={600}>
        {selectedOfferForModal && (
          <>
            <ModalHeader title="Offer Details" onClose={() => setSelectedOfferForModal(null)} />
            <div style={{ background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)", margin: isMobile ? "-4px -16px 20px" : "-4px -24px 20px", padding: isMobile ? "18px 20px" : "24px 28px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{selectedOfferForModal.id} · {selectedOfferForModal.role}</div>
                <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedOfferForModal.candidate}</h3>
              </div>
              <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "5px 14px", background: selectedOfferForModal.status === "Accepted" ? "rgba(52,211,153,0.2)" : selectedOfferForModal.status === "Rejected" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.12)", color: selectedOfferForModal.status === "Accepted" ? "#6EE7B7" : selectedOfferForModal.status === "Rejected" ? "#FCA5A5" : "rgba(255,255,255,0.7)", border: `1px solid ${selectedOfferForModal.status === "Accepted" ? "rgba(110,231,183,0.35)" : selectedOfferForModal.status === "Rejected" ? "rgba(252,165,165,0.35)" : "rgba(255,255,255,0.18)"}` }}>{selectedOfferForModal.status}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Offer ID", value: selectedOfferForModal.id },
                { label: "Candidate", value: selectedOfferForModal.candidate },
                { label: "Role Name", value: selectedOfferForModal.role },
                 {
                  label: "Interview Score",
                  value: (() => {
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistoryCandidate({ candidate: selectedOfferForModal.candidate, role: selectedOfferForModal.role });
                          }}
                          className="btn-view-history"
                        >
                          📊 View
                        </button>
                      </div>
                    );
                  })()
                },
                { label: "CTC (Monthly)", value: selectedOfferForModal.ctc || "—" },
                { label: "Issued Date", value: selectedOfferForModal.issued || "—" },
                { label: "Expiry Date", value: selectedOfferForModal.expiry || "—" },
                { label: "Expected Joining Date", value: selectedOfferForModal.joining || "—" },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: "10px 12px", background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</span>
                  <div style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>{item.value || "—"}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: isMobile ? "stretch" : "flex-end", borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              {selectedOfferForModal.ctc && selectedOfferForModal.issued && selectedOfferForModal.expiry ? (
                <Btn label="View Letter" variant="outline" onClick={(e) => { e.stopPropagation(); setViewOffer(selectedOfferForModal); setSelectedOfferForModal(null); }} style={{ flex: isMobile ? 1 : undefined }} />
              ) : (
                <Btn label="Generate Offer" onClick={(e) => { e.stopPropagation(); setGenForm({ candidate: selectedOfferForModal.candidate, role: selectedOfferForModal.role, ctc: "", expiry: "", joining: "" }); setGenOfferId(selectedOfferForModal.backendId ?? null); setGenRange(getRoleRange(selectedOfferForModal.role)); setShowGenerateModal(true); setSelectedOfferForModal(null); }} style={{ flex: isMobile ? 1 : undefined }} />
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!viewOffer} onClose={() => setViewOffer(null)} maxWidth={560}>
        {viewOffer && (
          <>
            <ModalHeader title="Offer Letter Preview" onClose={() => setViewOffer(null)} />
            <div style={{ background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)", margin: isMobile ? "-4px -16px 20px" : "-4px -24px 20px", padding: isMobile ? "18px 20px" : "24px 28px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Offer Letter Preview · {viewOffer.role}</div>
                <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{viewOffer.candidate}</h3>
              </div>
            </div>

            <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 12, padding: isMobile ? "16px 18px" : "24px 28px", marginBottom: 20, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ textAlign: "center", marginBottom: 20, borderBottom: `1px dashed ${T.border}`, paddingBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#72102a", fontFamily: font.heading }}>South Point School</div>
                <div style={{ fontSize: 12, color: T.inkLight, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Offer of Employment</div>
              </div>
              <div style={{ fontSize: 13.5, color: T.inkMid, lineHeight: 1.8, fontFamily: font.body }}>
                <p style={{ marginTop: 0 }}>Dear <strong>{viewOffer.candidate}</strong>,</p>
                <p>We are pleased to offer you the position of <strong>{viewOffer.role}</strong> at South Point School. The monthly compensation for this role is <strong style={{ color: T.tealDark }}>{viewOffer.ctc}</strong>.</p>
                <p>This offer is valid until <strong>{viewOffer.expiry}</strong>. Please confirm your acceptance by the deadline.</p>
                <p style={{ marginTop: 24, marginBottom: 0, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>Warm regards,<br /><strong style={{ color: T.ink }}>HR Department</strong><br /><span style={{ fontSize: 12, color: T.inkFaint }}>South Point School</span></p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: isMobile ? "stretch" : "flex-end", borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <Btn label="Download PDF" onClick={() => alert("PDF download would be implemented here.")} style={{ flex: isMobile ? 1 : undefined }} />
              <Btn label="Close" variant="ghost" onClick={() => setViewOffer(null)} style={{ flex: isMobile ? 1 : undefined }} />
            </div>
          </>
        )}
      </Modal>

      <Modal open={showGenerateModal} onClose={() => { setShowGenerateModal(false); setGenOfferId(null); }} maxWidth={520}>
        <ModalHeader title="Generate Offer Letter" onClose={() => { setShowGenerateModal(false); setGenOfferId(null); }} />
        <div style={{ background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)", margin: isMobile ? "-4px -16px 20px" : "-4px -24px 20px", padding: isMobile ? "18px 20px" : "24px 28px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✉️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Generate Offer Letter · {genForm.role}</div>
            <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{genForm.candidate}</h3>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          <FormField label="CTC (Monthly)" required>
            <Input type="number" placeholder={genRange ? genRange.label : "Enter monthly CTC"} value={genForm.ctc} onChange={(e) => setGenForm((p) => ({ ...p, ctc: e.target.value }))} style={{ width: "100%" }} />
            {genRange && <div style={{ marginTop: 6, fontSize: 11, color: T.inkLight }}>Allowed range: {genRange.label}</div>}
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <FormField label="Offer Expiry Date" required>
              <Input type="date" value={genForm.expiry} onChange={(e) => setGenForm((p) => ({ ...p, expiry: e.target.value }))} style={{ width: "100%" }} />
            </FormField>
            <FormField label="Expected Joining Date" required>
              <Input type="date" value={genForm.joining} onChange={(e) => setGenForm((p) => ({ ...p, joining: e.target.value }))} style={{ width: "100%" }} />
            </FormField>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: isMobile ? "stretch" : "flex-end", borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <Btn
            label={genSubmitting ? "Generating…" : "Generate & Send"}
            disabled={genSubmitting}
            onClick={async () => {
              if (!genForm.ctc || !genForm.expiry || !genForm.joining) { alert("Please fill all required fields."); return; }
              const ctcNumber = Number(genForm.ctc);
              if (!ctcNumber || ctcNumber <= 0) { alert("Enter valid CTC amount."); return; }
              if (genRange && (ctcNumber < genRange.min || ctcNumber > genRange.max)) { alert(`CTC must be between ${genRange.label}.`); return; }

              setGenSubmitting(true);
              try {
                const payload = {
                  candidate: genForm.candidate,
                  role: genForm.role,
                  ctc: `₹${ctcNumber.toLocaleString()}/mo`,
                  issued: new Date().toISOString().split("T")[0],
                  expiry: genForm.expiry,
                  joining: genForm.joining,
                  status: "Sent",
                };
                const saved = genOfferId != null
                  ? await updateOffer(genOfferId, payload)
                  : await createOffer(payload);
                setOffers((prev) => {
                  const idx = prev.findIndex((p) => p.backendId === saved.backendId);
                  if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; }
                  return [...prev, saved];
                });
                setShowGenerateModal(false);
                setGenForm({ candidate: "", role: "", ctc: "", expiry: "", joining: "" });
                setGenOfferId(null);
                setGenRange(null);
              } catch (err) {
                console.error("Failed to generate offer:", err);
                alert("Failed to generate offer. Please try again.");
              } finally {
                setGenSubmitting(false);
              }
            }}
            style={{ flex: isMobile ? 1 : undefined }}
          />
          <Btn label="Cancel" variant="ghost" disabled={genSubmitting} onClick={() => { setShowGenerateModal(false); setGenOfferId(null); }} style={{ flex: isMobile ? 1 : undefined }} />
        </div>
      </Modal>

      {/* Custom Rounds History Modal using same UI style as InterviewPanel */}
      <Modal open={!!historyCandidate} onClose={() => setHistoryCandidate(null)} maxWidth={700}>
        {historyCandidate && (
          <>
            <ModalHeader title="Interview Rounds History" onClose={() => setHistoryCandidate(null)} />
            
            {/* Header info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                padding: 16,
                background: T.primaryLight,
                borderRadius: 12,
              }}
            >
              {avatar(historyCandidate.candidate, 56, 18)}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{historyCandidate.candidate}</div>
                <div style={{ color: T.inkLight, fontSize: 13, marginTop: 2 }}>{historyCandidate.role}</div>
              </div>
            </div>

            {/* Rounds History Log */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 450, overflowY: "auto", paddingRight: 8 }}>
              {(() => {
                const candInts = interviews.filter((i) => i.candidate === historyCandidate.candidate && i.role === historyCandidate.role);
                const activeRnd = candInts.length > 0 ? Math.max(...candInts.map((i) => i.round || 1)) : 1;
                const roundsToRender = Array.from({ length: activeRnd }, (_, i) => i + 1).filter((r) => {
                  const hasInv = candInts.some((i) => i.round === r);
                  return r === activeRnd || hasInv;
                });

                return roundsToRender.map((r, idx, arr) => {
                  const roundInv = candInts.find((i) => i.round === r);
                  const isCompleted = roundInv?.status === "Completed";
                  const isScheduled = roundInv?.status === "Scheduled";
                  const hasInv = !!roundInv;

                  let nodeBg = "#E2E8F0";
                  let nodeBorder = "#CBD5E1";
                  if (hasInv) {
                    if (isCompleted) {
                      nodeBg = T.green;
                      nodeBorder = T.greenLight;
                    } else if (isScheduled) {
                      nodeBg = T.primary;
                      nodeBorder = T.primaryLight;
                    } else {
                      nodeBg = T.amber;
                      nodeBorder = T.amberLight;
                    }
                  }

                  return (
                    <div key={r} style={{ display: "flex", gap: 16 }} className="animate-fade-in-up">
                      {/* Timeline Indicator Column */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                        {/* Top line segment */}
                        <div style={{ width: 2, flex: idx === 0 ? "0 0 12px" : 1, background: idx === 0 ? "transparent" : T.border }} />
                        {/* Node */}
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: nodeBg,
                          border: `3px solid ${nodeBorder}`,
                          boxShadow: hasInv && !isCompleted ? `0 0 0 3px ${nodeBg}22` : "none",
                          flexShrink: 0,
                          zIndex: 2,
                          transition: "all 0.2s"
                        }} />
                        {/* Bottom line segment */}
                        <div style={{ width: 2, flex: idx === arr.length - 1 ? "0 0 12px" : 1, background: idx === arr.length - 1 ? "transparent" : T.border }} />
                      </div>

                      {/* Right Column: Card Content */}
                      <div style={{ flex: 1, paddingBottom: idx < arr.length - 1 ? 20 : 0 }}>
                        {!roundInv ? (
                          <div style={{
                            padding: "12px 16px",
                            background: "#F8FAFC",
                            borderRadius: 12,
                            border: `1.5px dashed ${T.border}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{getRoundOrdinal(r)}</span>
                              <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>Round has not been scheduled yet</div>
                            </div>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: T.amber,
                              background: T.amberLight,
                              border: `1px solid ${T.amber}33`,
                              padding: "3px 10px",
                              borderRadius: 99
                            }}>
                              Pending Schedule
                            </span>
                          </div>
                        ) : (
                          <div style={{
                            padding: "16px 20px",
                            background: isCompleted ? "#F0FDF4" : isScheduled ? "#F0F9FF" : "#FFFBEB",
                            borderRadius: 14,
                            border: `1.5px solid ${isCompleted ? "#DCFCE7" : isScheduled ? "#E0F2FE" : "#FEF3C7"}`,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 850, color: isCompleted ? "#166534" : isScheduled ? "#075985" : "#92400E" }}>
                                {getRoundOrdinal(r)}
                              </span>
                              <Badge label={roundInv.status} variant={statusVariant(roundInv.status)} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 16px", fontSize: 11.5, color: T.inkMid }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>📅</span>
                                <div>
                                  <div style={{ fontSize: 9.5, color: T.inkFaint, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Date &amp; Time</div>
                                  <div style={{ fontWeight: 600, color: T.ink }}>{roundInv.date ? formatDateAndTime(roundInv.date, roundInv.time) : "Not Scheduled"}</div>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>🏢</span>
                                <div>
                                  <div style={{ fontSize: 9.5, color: T.inkFaint, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Mode</div>
                                  <div style={{ fontWeight: 600, color: T.ink }}>{roundInv.mode || "In-Person"}</div>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>👥</span>
                                <div>
                                  <div style={{ fontSize: 9.5, color: T.inkFaint, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Panelists</div>
                                  <div style={{ fontWeight: 600, color: T.ink }}>{roundInv.panel?.join(", ") || "None"}</div>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>📊</span>
                                <div>
                                  <div style={{ fontSize: 9.5, color: T.inkFaint, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Evaluation Status</div>
                                  <div style={{ fontWeight: 600, color: T.ink }}>
                                    {(() => {
                                      const evals = roundInv.evaluations || [];
                                      const summary = roundInv.evaluationSummary;
                                      if (evals.length > 0) {
                                        const avgScore = summary?.average_score ?? Math.round(evals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evals.length);
                                        return (
                                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                            <strong style={{ color: avgScore >= 80 ? T.green : avgScore >= 60 ? T.accentDark : T.red }}>{avgScore}/100</strong>
                                            <span style={{ fontSize: 10, background: "rgba(0,0,0,0.06)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                                              {summary?.submitted_count ?? evals.length}/{summary?.assigned_count ?? (roundInv.panel?.length || "?")} evaluated
                                            </span>
                                          </span>
                                        );
                                      }
                                      return <span style={{ color: T.inkFaint, fontStyle: "italic" }}>Not Evaluated</span>;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Per-Panelist Evaluation Scorecards */}
                            {(roundInv.evaluations || []).length > 0 && (
                              <div style={{ marginTop: 20, borderTop: "1.5px solid rgba(0,0,0,0.06)", paddingTop: 18 }}>
                                <div style={{ 
                                  fontSize: 10, 
                                  fontWeight: 800, 
                                  color: T.inkLight, 
                                  textTransform: "uppercase", 
                                  letterSpacing: "0.08em", 
                                  marginBottom: 14,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6
                                }}>
                                  <span>📋</span> Panelist Evaluations ({roundInv.evaluations.length})
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                  {roundInv.evaluations.map((ev, evIdx) => {
                                    const pName = ev.panelistId != null
                                      ? (panelists.find((p) => p.backendId === ev.panelistId)?.name || `Panelist #${ev.panelistId}`)
                                      : `Panelist ${evIdx + 1}`;
                                    const criteriaEntries = Object.entries(ev.criteria || {});
                                    const evScore = ev.overallScore ?? (criteriaEntries.length > 0 ? Math.round((criteriaEntries.reduce((s, [, v]) => s + v, 0) / criteriaEntries.length) * 20) : null);

                                    const REC_COLORS = {
                                      "Strong Hire": { bg: "#ECFDF5", color: "#059669" },
                                      "Hire": { bg: "#F0FDF4", color: "#16A34A" },
                                      "Hold": { bg: "#FFFBEB", color: "#D97706" },
                                      "Reject": { bg: "#FEF2F2", color: "#DC2626" },
                                      "Selected": { bg: "#ECFDF5", color: "#059669" },
                                      "Rejected": { bg: "#FEF2F2", color: "#DC2626" },
                                      "On Hold": { bg: "#FFFBEB", color: "#D97706" },
                                      "Next Round": { bg: "#F0F9FF", color: "#0284C7" },
                                    };
                                    const recStyle = REC_COLORS[ev.rec] || { bg: "#F8FAFC", color: T.inkLight };

                                    return (
                                      <div 
                                        key={evIdx} 
                                        style={{ 
                                          background: "#ffffff", 
                                          borderRadius: 16, 
                                          border: "1px solid #ECE7E1", 
                                          borderLeft: `5px solid ${recStyle.color}`,
                                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
                                          overflow: "hidden",
                                          padding: "16px 20px"
                                        }}
                                      >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ 
                                              width: 36, 
                                              height: 36, 
                                              borderRadius: "50%", 
                                              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`, 
                                              color: "#ffffff", 
                                              display: "flex", 
                                              alignItems: "center", 
                                              justifyContent: "center", 
                                              fontWeight: 800, 
                                              fontSize: 12, 
                                              flexShrink: 0,
                                              boxShadow: "0 3px 8px rgba(114, 16, 42, 0.15)"
                                            }}>
                                              {pName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                              <div style={{ fontSize: 13.5, fontWeight: 800, color: T.ink, letterSpacing: "-0.01em" }}>{pName}</div>
                                              {ev.submittedAt && (
                                                <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                                                  <span>📅</span>
                                                  {new Date(ev.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {ev.rec && ev.rec !== "—" && (
                                              <span style={{ 
                                                fontSize: 10.5, 
                                                fontWeight: 700, 
                                                borderRadius: 100, 
                                                padding: "4px 12px", 
                                                background: recStyle.bg, 
                                                color: recStyle.color, 
                                                border: `1px solid ${recStyle.color}1A`,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4
                                              }}>
                                                {ev.rec}
                                              </span>
                                            )}
                                            {evScore !== null && (
                                              <span style={{ 
                                                fontSize: 11, 
                                                fontWeight: 800, 
                                                color: evScore >= 80 ? T.green : evScore >= 60 ? T.accentDark : T.red,
                                                background: evScore >= 80 ? T.greenLight : evScore >= 60 ? T.accentLight : T.redLight,
                                                padding: "4px 10px", 
                                                borderRadius: 100,
                                                border: `1px solid ${evScore >= 80 ? "#A7F3D0" : evScore >= 60 ? T.border : "#FCA5A5"}`
                                              }}>
                                                ★ {evScore}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Criteria scores grid */}
                                        {criteriaEntries.length > 0 && (
                                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: T.canvas, padding: 12, borderRadius: 10, marginBottom: 12, border: `1px solid ${T.border}` }}>
                                            {criteriaEntries.map(([cName, cVal]) => (
                                              <div key={cName} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                                                <span style={{ color: T.inkLight }}>{cName}</span>
                                                <strong style={{ color: T.ink }}>{cVal}/5</strong>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Remarks */}
                                        {ev.notes && (
                                          <div style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.5, background: T.canvas, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontStyle: "italic" }}>
                                            "{ev.notes}"
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
