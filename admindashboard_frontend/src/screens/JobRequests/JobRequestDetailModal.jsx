import { useEffect } from "react";
import { createPortal } from "react-dom";
import { T } from "../../theme";
import { statusVariant } from "../../theme";
import { Btn, Input, Select, Badge } from "../../components/ui";
import { VACANCY_OPTIONS, QUAL_OPTIONS, TYPE_OPTIONS, CATEGORY_OPTIONS, ALL_SKILLS } from "../../data";
import SkillsMultiSelect from "../../components/SkillsMultiSelect";
import JobRequestActivityTimeline from "./JobRequestActivityTimeline";

const labelStyle = { fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 };
const Label = ({ children }) => <div style={labelStyle}>{children}</div>;

const textareaStyle = { width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink };

// weight = font-weight used when the value is shown read-only
const FIELDS = [
  { key: "department", label: "Department", type: "select", placeholder: "Select department…", weight: 600 },
  { key: "role", label: "Role", type: "select", placeholder: "Select role…", weight: 700 },
  { key: "vacancies", label: "Vacancies", type: "select", options: VACANCY_OPTIONS, placeholder: "Select count…", weight: 400 },
  { key: "exp", label: "Experience", type: "input", placeholder: "Enter experience", weight: 600 },
  { key: "qual", label: "Educational Qualification", type: "select", options: QUAL_OPTIONS, placeholder: "Select qualification…", weight: 600 },
  { key: "type", label: "Employment Type", type: "select", options: TYPE_OPTIONS, placeholder: "Select type…", weight: 400 },
  { key: "location", label: "Location", type: "input", placeholder: "Enter job location", weight: 400 },
  { key: "category", label: "Category", type: "select", options: CATEGORY_OPTIONS, placeholder: "Select category…", weight: 600 },
  { key: "salary", label: "Salary Range", type: "input", placeholder: "Enter salary range", weight: 700, span2: true },
];

const TEXT_FIELDS = [
  { key: "description", label: "Job Description", placeholder: "Enter job description" },
  { key: "justification", label: "Justification", placeholder: "Why is this job needed?" },
];

export default function JobRequestDetailModal({
  selectedRequest,
  setSelectedRequest,
  isMobile,
  deptOptions,
  getRoleOptionsForDept,
  handleDepartmentChangeInModal,
  handleRoleChangeInModal,
  hasChanges,
  handleAccept,
  cancelJobRequest,
  onClose,
  currentUser,
}) {
  const isEditable = selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back";
  const patch = (key, value) => setSelectedRequest({ ...selectedRequest, [key]: value });

  // Lock body scroll and page content scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const scrollContainer = document.querySelector(".animate-fade-in-up");
    if (scrollContainer) {
      scrollContainer.style.overflowY = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      if (scrollContainer) {
        scrollContainer.style.overflowY = "auto";
      }
    };
  }, []);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)", // Increased blur slightly for better premium effect
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface, borderRadius: 16, width: "100%", maxWidth: 580,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          position: "sticky", top: 0, background: T.surface, zIndex: 1,
          borderRadius: "16px 16px 0 0",
        }}>
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <Badge label="Job Request" variant="blue" />
              <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
              {selectedRequest.role || "Job Request Details"}
            </div>
            <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
              {selectedRequest.department ? `${selectedRequest.department} · ` : ""}
              {selectedRequest.location ? `${selectedRequest.location}` : ""}
              {selectedRequest.date ? ` · ${selectedRequest.date}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 8,
              width: 32, height: 32, fontSize: 18, color: T.inkMid, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, lineHeight: 1,
            }}
          >×</button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.canvas, borderRadius: 10, padding: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {FIELDS.map((f) => {
                const value = selectedRequest[f.key] || "";
                const onChange = f.key === "department"
                  ? (e) => handleDepartmentChangeInModal(e.target.value)
                  : f.key === "role"
                  ? (e) => handleRoleChangeInModal(e.target.value)
                  : (e) => patch(f.key, e.target.value);
                const options = f.key === "department"
                  ? deptOptions
                  : f.key === "role"
                  ? getRoleOptionsForDept(selectedRequest.department)
                  : f.options;
                const placeholder = f.placeholder;
                return (
                  <div key={f.key} style={{ gridColumn: f.span2 && !isMobile ? "span 2" : "auto" }}>
                    <Label>{f.label}</Label>
                    {isEditable ? (
                      f.type === "select" ? (
                        <Select
                          value={value}
                          onChange={onChange}
                          options={options}
                          placeholder={placeholder}
                        />
                      ) : (
                        <Input value={value} onChange={onChange} placeholder={f.placeholder} />
                      )
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: f.weight, color: T.ink }}>{value || "—"}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Required Skills */}
            <div>
              <Label>Required Skills</Label>
              {isEditable ? (
                <SkillsMultiSelect
                  options={ALL_SKILLS}
                  selected={selectedRequest.skills || []}
                  onChange={(v) => patch("skills", v)}
                  placeholder="Select required skills…"
                />
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(selectedRequest.skills || []).length > 0
                    ? (selectedRequest.skills || []).map((s) => (
                        <span key={s} style={{
                          background: T.primaryLight || "#EDE9FE",
                          color: T.primary,
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                        }}>{s}</span>
                      ))
                    : <span style={{ fontSize: 13, color: T.inkFaint }}>—</span>
                  }
                </div>
              )}
            </div>

            {TEXT_FIELDS.map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                {isEditable ? (
                  <textarea
                    value={selectedRequest[f.key] || ""}
                    onChange={(e) => patch(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={textareaStyle}
                  />
                ) : (
                  <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest[f.key] || "—"}</div>
                )}
              </div>
            ))}
          </div>

          <JobRequestActivityTimeline
            history={selectedRequest.history}
            currentUser={currentUser}
            justification={selectedRequest.justification}
            requestedBy={selectedRequest.submittedBy}
          />
        </div>

        {isEditable && (
          <div style={{
            padding: "16px 24px",
            borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
            background: T.canvas, borderRadius: "0 0 16px 16px",
          }}>
            <Btn label="Cancel Request" variant="danger" small onClick={() => cancelJobRequest(selectedRequest.id)} />
            <Btn
              label={hasChanges() ? "Resubmit as New Request" : "Accept"}
              variant="success"
              small
              onClick={handleAccept}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
