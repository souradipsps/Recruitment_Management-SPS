import { createPortal } from "react-dom";
import { T } from "../../theme";
import { statusVariant } from "../../theme";
import { Badge, Btn, Select } from "../../components/ui";
import { QUAL_OPTIONS, TYPE_OPTIONS, VACANCY_OPTIONS, CATEGORY_OPTIONS, ALL_SKILLS } from "../../data";
import SkillsMultiSelect from "../../components/SkillsMultiSelect";
import { labelCss } from "./constants";
import ActivityChatHistory from "../../components/ActivityChatHistory";

// Only Active roles (Existing Roles screen) are eligible to be requested against.
const isActiveRole = (r) => (r.currentStatus || r.status) === "Active";

/**
 * Full-screen portal modal showing request details, editable fields for
 * Pending requests, activity history, comment textarea, and action buttons.
 */
export default function ApprovalModal({ sel, setSel, closeModal, isPending, comment, setComment, fieldErrors, setFieldErrors, takeAction, isMobile, existingRoles, currentUser, isActionPending }) {
  if (!sel) return null;

  const isExistingRole = sel.type === "Job Request" && (existingRoles || []).some(
    (r) => r.role === sel.role && r.dept === sel.dept && (r.currentStatus || r.status) === "Active"
  );

  // Lock body scroll and page content scroll when modal is open
  const rawHistory = sel.history || [];
  const aggregatedHistory = rawHistory.some((h) => h.act === "Submitted")
    ? rawHistory
    : [{ act: "Submitted", by: sel.requestedBy || "User", date: sel.date, note: "" }, ...rawHistory];

  // Department list sourced from existing (sanctioned) roles that have at least one Active role.
  const deptOptions = [...new Set((existingRoles || []).filter(isActiveRole).map((r) => r.dept).filter(Boolean))]
    .map((d) => ({ value: d, label: d }));

  // Active roles for a given department (or all active roles when no department is selected yet).
  const getRoleOptionsForDept = (department) => {
    const seen = new Set();
    const opts = [];
    for (const r of existingRoles || []) {
      if (!r.role || seen.has(r.role)) continue;
      if (!isActiveRole(r)) continue;
      if (department && r.dept !== department) continue;
      seen.add(r.role);
      opts.push({ value: r.role, label: r.role });
    }
    return opts;
  };

  const handleDepartmentChange = (department) => {
    setSel({ ...sel, dept: department, role: "", experience: "", salary: "", empType: "" });
  };

  const handleRoleChange = (role) => {
    const matchingRole = (existingRoles || []).find((r) => r.role === role && (!sel.dept || r.dept === sel.dept));
    setSel({
      ...sel,
      role,
      experience: matchingRole ? (matchingRole.experience || "") : sel.experience,
      salary: matchingRole ? (matchingRole.salaryRange || "") : sel.salary,
      empType: matchingRole ? (matchingRole.type || "") : sel.empType,
    });
  };

  return createPortal(
    <div
      onClick={closeModal}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface, borderRadius: 16,
          width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* ── Sticky header ── */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          position: "sticky", top: 0, background: T.surface, zIndex: 1,
          borderRadius: "16px 16px 0 0",
        }}>
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <Badge label={sel.type || "Request"} variant="blue" />
              <Badge label={sel.status} variant={statusVariant(sel.status)} />
              {isPending && isExistingRole && (
                <button
                  type="button"
                  onClick={() => {
                    setSel({
                      ...sel,
                      role: "",
                      experience: "",
                      salary: "",
                      empType: "",
                    });
                  }}
                  style={{
                    border: "none",
                    background: "#F3F4F6",
                    color: "#4B5563",
                    padding: "3px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 11,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => e.target.style.background = "#E5E7EB"}
                  onMouseOut={(e) => e.target.style.background = "#F3F4F6"}
                >
                  Clear Role
                </button>
              )}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
              {sel.type === "Role Request" ? "Role Request Details" : sel.role}
            </div>
            <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
              {sel.type === "Role Request"
                ? `${sel.requestedBy} · ${sel.date}`
                : `${sel.dept && sel.dept !== "N/A" ? `${sel.dept} · ` : ""}${sel.requestedBy} · ${sel.date}`}
            </div>
          </div>
          <button
            onClick={closeModal}
            style={{
              background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 8,
              width: 32, height: 32, fontSize: 18, color: T.inkMid, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.canvas, borderRadius: 10, padding: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* ── Role Request fields ── */}
            {sel.type === "Role Request" && (
              <div>
                <div style={labelCss}>Department</div>
                {isPending ? (
                  <input value={sel.dept || ""} onChange={(e) => setSel({ ...sel, dept: e.target.value })} placeholder="e.g. Science"
                    style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }} />
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{sel.dept || "—"}</div>
                )}
              </div>
            )}

            {sel.type === "Role Request" && (
              <div>
                <div style={labelCss}>Role Name</div>
                {isPending ? (
                  <input value={sel.role || ""} onChange={(e) => setSel({ ...sel, role: e.target.value })} placeholder="e.g. Mathematics Teacher"
                    style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }} />
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{sel.role || "—"}</div>
                )}
              </div>
            )}

            {/* Variations */}
            {sel.type === "Role Request" && (
              <div>
                <div style={labelCss}>Variations (Type, Experience, Salary)</div>
                {isPending ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(sel.variations || []).map((v, vIndex) => (
                      <div key={v.id || vIndex} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.canvas, position: "relative" }}>
                        {sel.variations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSel((prev) => ({
                                ...prev,
                                variations: prev.variations.filter((_, idx) => idx !== vIndex)
                              }));
                            }}
                            style={{ position: "absolute", top: 6, right: 6, border: "none", background: "#FEE2E2", color: "#DC2626", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 700 }}
                          >
                            Remove
                          </button>
                        )}
                        
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 2 }}>Employee Type</div>
                          <Select
                            value={v.type}
                            onChange={(e) => {
                              setSel((prev) => {
                                const u = prev.variations.map((item, idx) => idx === vIndex ? { ...item, type: e.target.value } : item);
                                return { ...prev, variations: u };
                              });
                            }}
                            options={TYPE_OPTIONS}
                            placeholder="Select type…"
                          />
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 2 }}>Min Experience (Yrs)</div>
                            <input
                              value={v.minExperience ?? v.experience?.split("-")[0] ?? ""}
                              onChange={(e) => {
                                setSel((prev) => {
                                  const u = prev.variations.map((item, idx) => idx === vIndex ? { ...item, minExperience: e.target.value } : item);
                                  return { ...prev, variations: u };
                                });
                              }}
                              placeholder="e.g. 2"
                              style={{ width: "100%", padding: 8, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 2 }}>Max Experience (Yrs)</div>
                            <input
                              value={v.maxExperience ?? v.experience?.split("-")[1] ?? ""}
                              onChange={(e) => {
                                setSel((prev) => {
                                  const u = prev.variations.map((item, idx) => idx === vIndex ? { ...item, maxExperience: e.target.value } : item);
                                  return { ...prev, variations: u };
                                });
                              }}
                              placeholder="e.g. 5"
                              style={{ width: "100%", padding: 8, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                            />
                          </div>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 2 }}>Min Salary (₹)</div>
                            <input
                              value={v.minSalary ?? v.salaryRange?.split("-")[0] ?? ""}
                              onChange={(e) => {
                                setSel((prev) => {
                                  const u = prev.variations.map((item, idx) => idx === vIndex ? { ...item, minSalary: e.target.value } : item);
                                  return { ...prev, variations: u };
                                });
                              }}
                              placeholder="e.g. 40,000"
                              style={{ width: "100%", padding: 8, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 2 }}>Max Salary (₹)</div>
                            <input
                              value={v.maxSalary ?? v.salaryRange?.split("-")[1] ?? ""}
                              onChange={(e) => {
                                setSel((prev) => {
                                  const u = prev.variations.map((item, idx) => idx === vIndex ? { ...item, maxSalary: e.target.value } : item);
                                  return { ...prev, variations: u };
                                });
                              }}
                              placeholder="e.g. 60,000"
                              style={{ width: "100%", padding: 8, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSel((prev) => ({
                          ...prev,
                          variations: [
                            ...(prev.variations || []),
                            {
                              id: Date.now() + Math.random(),
                              type: "",
                              minExperience: "",
                              maxExperience: "",
                              minSalary: "",
                              maxSalary: "",
                            }
                          ]
                        }));
                      }}
                      style={{ border: "none", background: T.skyLight, color: T.sky, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, alignSelf: "flex-end" }}
                    >
                      + Add Variation
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(sel.variations || []).map((v, idx) => (
                      <div key={v.id || idx} style={{ fontSize: 13, fontWeight: 600, color: T.ink, padding: "6px 12px", background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}` }}>
                        <strong>{v.type || "Full-time"}</strong> ({v.experience ? `${v.experience} yrs` : "—"}) : {v.salaryRange ? `₹${v.salaryRange}` : "—"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Job Request fields ── */}
            {sel.type === "Job Request" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={labelCss}>Department</div>
                  {isPending ? (
                    <select
                      value={sel.dept || ""}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      disabled={isExistingRole}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        fontSize: 13,
                        outline: "none",
                        background: isExistingRole ? T.canvas : T.surface,
                        color: T.ink,
                        cursor: isExistingRole ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="">Select department…</option>
                      {deptOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{sel.dept && sel.dept !== "N/A" ? sel.dept : "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Role</div>
                  {isPending ? (
                    <select
                      value={sel.role || ""}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={!sel.dept || isExistingRole}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        fontSize: 13,
                        outline: "none",
                        background: (sel.dept && !isExistingRole) ? T.surface : T.canvas,
                        color: T.ink,
                        cursor: (sel.dept && !isExistingRole) ? "pointer" : "not-allowed"
                      }}
                    >
                      <option value="">{sel.dept ? "Select role…" : "Select department first"}</option>
                      {getRoleOptionsForDept(sel.dept).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{sel.role || "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Location</div>
                  {isPending ? (
                    <input value={sel.location || ""} onChange={(e) => setSel({ ...sel, location: e.target.value })} placeholder="Enter location"
                      style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }} />
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink }}>{sel.location || "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Category</div>
                  {isPending ? (
                    <select value={sel.category || ""} onChange={(e) => setSel({ ...sel, category: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, color: T.ink }}>
                      <option value="">Select category…</option>
                      {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink }}>{sel.category || "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Vacancies</div>
                  {isPending ? (
                    <select value={sel.vacancies || ""} onChange={(e) => setSel({ ...sel, vacancies: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, color: T.ink }}>
                      <option value="">Select…</option>
                      {VACANCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{sel.vacancies || "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Experience</div>
                  {isPending ? (
                    <input
                      value={sel.experience || ""}
                      onChange={(e) => setSel({ ...sel, experience: e.target.value })}
                      placeholder="Enter experience"
                      disabled={isExistingRole}
                      style={{
                        width: "100%",
                        padding: 9,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        background: isExistingRole ? T.canvas : T.surface,
                        color: T.ink,
                        cursor: isExistingRole ? "not-allowed" : "text"
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{sel.experience || "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Educational Qualification</div>
                  {isPending ? (
                    <SkillsMultiSelect
                      options={QUAL_OPTIONS.map((o) => o.value)}
                      selected={sel.qual || []}
                      onChange={(v) => setSel({ ...sel, qual: v })}
                      placeholder="Select qualification(s)…"
                    />
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink }}>{(sel.qual || []).join(", ") || "—"}</div>
                  )}
                </div>
                <div>
                  <div style={labelCss}>Employment Type</div>
                  {isPending ? (
                    <select
                      value={sel.empType || ""}
                      onChange={(e) => setSel({ ...sel, empType: e.target.value })}
                      disabled={isExistingRole}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        fontSize: 13,
                        outline: "none",
                        background: isExistingRole ? T.canvas : T.surface,
                        color: T.ink,
                        cursor: isExistingRole ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="">Select…</option>
                      {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink }}>{sel.empType || "—"}</div>
                  )}
                </div>
                <div style={{ gridColumn: isMobile ? "auto" : "span 2" }}>
                  <div style={labelCss}>Salary Range</div>
                  {isPending ? (
                    <input value={sel.salary || ""} onChange={(e) => setSel({ ...sel, salary: e.target.value })} placeholder="Enter salary range"
                      style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }} />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{sel.salary || "—"}</div>
                  )}
                </div>
              </div>
            )}

            {sel.type === "Job Request" && (
              <div>
                <div style={labelCss}>Required Skills</div>
                {isPending ? (
                  <SkillsMultiSelect options={ALL_SKILLS} selected={sel.skills || []} onChange={(v) => setSel({ ...sel, skills: v })} placeholder="Select required skills…" />
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(sel.skills || []).length > 0
                      ? (sel.skills || []).map((s) => (
                          <span key={s} style={{ background: T.primaryLight || "#EDE9FE", color: T.primary, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s}</span>
                        ))
                      : <span style={{ fontSize: 13, color: T.inkFaint }}>—</span>
                    }
                  </div>
                )}
              </div>
            )}

            {sel.type === "Job Request" && (
              <div>
                <div style={labelCss}>Job Description</div>
                {isPending ? (
                  <textarea value={sel.description || ""} onChange={(e) => setSel({ ...sel, description: e.target.value })} placeholder="Enter job description…"
                    style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }} />
                ) : (
                  <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{sel.description || "—"}</div>
                )}
              </div>
            )}

            {sel.just && (
              <div>
                <div style={labelCss}>Justification</div>
                <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{sel.just}</div>
              </div>
            )}
          </div>

          <ActivityChatHistory
            history={aggregatedHistory}
            currentUser={currentUser}
            justification={sel.just || sel.description}
            requestedBy={sel.requestedBy}
            mode="approver"
          />

          {/* Comment / resolved status */}
          {isPending ? (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.inkLight, display: "block", marginBottom: 6 }}>
                Comment <span style={{ color: T.inkFaint, fontWeight: 400 }}>(required for Sent Back)</span>
              </label>
              <textarea
                placeholder="Add a comment or reason…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 10, fontSize: 13,
                  width: "100%", minHeight: 80, resize: "vertical", outline: "none",
                  boxSizing: "border-box", color: T.ink, background: T.canvas,
                }}
              />
            </div>
          ) : (
            <div style={{
              background: sel.status === "Approved" ? T.greenLight : sel.status === "Rejected" ? T.redLight : T.amberLight,
              borderRadius: 10, padding: "12px 16px",
              border: `1px solid ${sel.status === "Approved" ? "#A7F3D0" : sel.status === "Rejected" ? "#FECACA" : "#FDE68A"}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: sel.status === "Approved" ? T.green : sel.status === "Rejected" ? T.red : T.amber }}>
                {sel.status === "Approved" ? "✓ Approved" : sel.status === "Rejected" ? "✕ Rejected" : "↺ Sent Back"}
              </div>
              {sel.comment && <div style={{ fontSize: 12, color: T.inkMid, marginTop: 4 }}>{sel.comment}</div>}
            </div>
          )}
        </div>

        {/* ── Action button footer (Pending only) ── */}
        {isPending && (
          <div style={{
            padding: "16px 24px",
            borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
            background: T.canvas, borderRadius: "0 0 16px 16px",
          }}>
            <Btn
              label={isActionPending ? "Processing..." : "Sendback"}
              variant="amber"
              small
              disabled={isActionPending}
              onClick={() => { if (!comment.trim()) { alert("Please add a comment before sending back."); return; } takeAction("Sent Back"); }}
            />
            <Btn
              label={isActionPending ? "Processing..." : "Reject"}
              variant="danger"
              small
              disabled={isActionPending}
              onClick={() => { if (!sel) return; takeAction("Rejected"); }}
            />
            <Btn
              label={isActionPending ? "Processing..." : "Accept"}
              variant="success"
              small
              disabled={isActionPending}
              onClick={() => { takeAction("Approved"); }}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
