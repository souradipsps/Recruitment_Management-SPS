import { T } from "../../theme";
import { Card, Btn, Input, Select, FormField } from "../../components/ui";
import { VACANCY_OPTIONS, QUAL_OPTIONS, TYPE_OPTIONS } from "../../data";
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
            <FormField label="Role" required>
              <Select value={form.role} onChange={(e) => handleRoleChange(index, e.target.value)} options={roleOptions} placeholder="Select role…" />
            </FormField>
            <FormField label="Experience" required>
              <Input placeholder="Enter experience" value={form.exp} onChange={(e) => updateForm(index, "exp", e.target.value)} />
            </FormField>
            <FormField label="Salary Range" required>
              <Input placeholder="Enter salary range" value={form.salary} onChange={(e) => updateForm(index, "salary", e.target.value)} />
            </FormField>
            <FormField label="Qualification" required>
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

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <Btn label="Submit Request" onClick={submitRequests} />
        {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setJobForms((p) => [...p, emptyForm()])} />}
        <Btn label="Cancel" variant="ghost" onClick={onCancel} />
      </div>
    </div>
  );
}
