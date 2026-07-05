import { T } from "../../theme";
import { Card, Btn, Input, Select, FormField } from "../../components/ui";
import { VACANCY_OPTIONS, QUAL_OPTIONS, TYPE_OPTIONS, DEPT_OPTIONS, CATEGORY_OPTIONS, ALL_SKILLS } from "../../data";
import SkillsMultiSelect from "../../components/SkillsMultiSelect";
import { emptyForm } from "./jobRequestUtils";

export default function JobRequestForm({
  jobForms,
  setJobForms,
  editingId,
  isMobile,
  roleOptions,
  handleRoleChange,
  updateForm,
  submitRequests,
<<<<<<< HEAD
=======
  submitting,
  submitError,
>>>>>>> 0e928b01990185edb7148468322d2160324cb7e4
  onCancel,
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      {jobForms.map((form, index) => (
        <Card key={form.id} style={{ padding: 20, marginBottom: 16, borderTop: `3px solid ${T.blue}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
              {editingId ? "Edit Job Request" : `Job Request #${index + 1}`}
            </div>
            {jobForms.length > 1 && (
              <button onClick={() => setJobForms((p) => p.filter((_, i) => i !== index))}
                style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                Remove
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <FormField label="Department" required>
              <Select value={form.department} onChange={(e) => updateForm(index, "department", e.target.value)} options={DEPT_OPTIONS} placeholder="Select department…" />
            </FormField>
            <FormField label="Role" required>
              <Select value={form.role} onChange={(e) => handleRoleChange(index, e.target.value)} options={roleOptions} placeholder="Select role…" />
            </FormField>
            <FormField label="Experience" required>
              <Input placeholder="Enter experience" value={form.exp} onChange={(e) => updateForm(index, "exp", e.target.value)} />
            </FormField>
            <FormField label="Salary Range" required>
              <Input placeholder="Enter salary range" value={form.salary} onChange={(e) => updateForm(index, "salary", e.target.value)} />
            </FormField>
            <FormField label="Educational Qualification" required>
              <Select value={form.qual} onChange={(e) => updateForm(index, "qual", e.target.value)} options={QUAL_OPTIONS} placeholder="Select qualification…" />
            </FormField>
            <FormField label="Vacancies" required>
              <Select value={form.vacancies} onChange={(e) => updateForm(index, "vacancies", e.target.value)} options={VACANCY_OPTIONS} placeholder="Select count…" />
            </FormField>
            <FormField label="Employment Type" required>
              <Select value={form.type} onChange={(e) => updateForm(index, "type", e.target.value)} options={TYPE_OPTIONS} placeholder="Select type…" />
            </FormField>
            <FormField label="Location" required>
              <Input placeholder="Enter job location" value={form.location} onChange={(e) => updateForm(index, "location", e.target.value)} />
            </FormField>
            <FormField label="Category" required>
              <Select value={form.category} onChange={(e) => updateForm(index, "category", e.target.value)} options={CATEGORY_OPTIONS} placeholder="Select category…" />
            </FormField>
          </div>

          <div style={{ marginBottom: 14 }}>
            <FormField label="Required Skills" required>
              <SkillsMultiSelect
                options={ALL_SKILLS}
                selected={form.skills || []}
                onChange={(v) => updateForm(index, "skills", v)}
                placeholder="Select required skills…"
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <FormField label="Job Description" required>
              <textarea
                value={form.description}
                onChange={(e) => updateForm(index, "description", e.target.value)}
                placeholder="Enter job description"
                style={{ width: "100%", minHeight: 100, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
              />
            </FormField>
            <FormField label="Justification" required>
              <textarea
                value={form.justification}
                onChange={(e) => updateForm(index, "justification", e.target.value)}
                placeholder="Why is this job needed?"
                style={{ width: "100%", minHeight: 100, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
              />
            </FormField>
          </div>
        </Card>
      ))}

<<<<<<< HEAD
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <Btn label="Submit Request" onClick={submitRequests} />
        {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setJobForms((p) => [...p, emptyForm()])} />}
        <Btn label="Cancel" variant="ghost" onClick={onCancel} />
=======
      {submitError && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", fontSize: 13, fontWeight: 600, border: "1px solid #FCA5A5" }}>
          {submitError}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <Btn
          label={submitting ? "Submitting…" : "Submit Request"}
          onClick={submitRequests}
          style={submitting ? { opacity: 0.6, pointerEvents: "none" } : {}}
        />
        {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setJobForms((p) => [...p, emptyForm()])} disabled={submitting} />}
        <Btn label="Cancel" variant="ghost" onClick={onCancel} disabled={submitting} />
>>>>>>> 0e928b01990185edb7148468322d2160324cb7e4
      </div>
    </div>
  );
}
