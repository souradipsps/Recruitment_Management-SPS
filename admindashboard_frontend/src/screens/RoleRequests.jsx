import { useState, useRef, useEffect } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Btn, Input, Badge, FormField, Modal, ModalHeader, Textarea, Select } from "../components/ui";
import { CATEGORY_OPTIONS } from "../data";
import { createRoleRequest } from "../api/roleRequestsApi";
import "./RoleRequests.css";

const getStatusStyle = (status) => {
  switch (status) {
    case "Approved": return { border: `1.5px solid ${T.green}`, background: T.greenLight, color: T.green };
    case "Rejected": return { border: "1.5px solid #DC2626", background: "#FEE2E2", color: "#DC2626" };
    case "Cancelled": return { border: "1.5px solid #6B7280", background: "#F3F4F6", color: "#6B7280" };
    case "Sent Back": return { border: `1.5px solid ${T.amber}`, background: T.amberLight, color: T.amber };
    default: return { border: `1.5px solid ${T.blue}`, background: T.blueLight, color: T.blue };
  }
};

const emptyForm = () => ({
  id: Date.now() + Math.random(),
  dept: "",
  role: "",
  minExperience: "",
  maxExperience: "",
  minSalary: "",
  maxSalary: "",
  just: "",
  date: new Date().toLocaleDateString(),
  status: "Pending",
  comment: "",
});

export default function RoleRequests({ roleRequests, setRoleRequests, setApprovalRequests, setExistingRoles, onNavigateToExistingRoles }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [showForm, setShowForm] = useState(false);
  const [roleForms, setRoleForms] = useState([emptyForm()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [originalRequest, setOriginalRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const statuses = ["All", "Pending", "Approved", "Rejected", "Cancelled", "Sent Back"];

  const filteredRequests = roleRequests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => {
      const query = search.toLowerCase();
      return (
        (r.role || "").toLowerCase().includes(query) ||
        (r.dept || "").toLowerCase().includes(query) ||
        (String(r.id) || "").toLowerCase().includes(query)
      );
    });

  const ITEMS_PER_PAGE = 10;
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayFiltered = filteredRequests.slice(startIndex, endIndex);

  const counts = statuses.reduce((acc, status) => {
    acc[status] = status === "All"
      ? roleRequests.length
      : roleRequests.filter((r) => r.status === status).length;
    return acc;
  }, {});

  const updateForm = (index, key, value) => {
    setRoleForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (updated[index]) {
        const fieldErrors = { ...updated[index] };
        delete fieldErrors[key];
        updated[index] = fieldErrors;
      }
      return updated;
    });
  };

  const parseSalary = (val) => parseFloat(val.replace(/,/g, "")) || 0;

  const validateForms = () => {
    const errors = {};
    let valid = true;
    roleForms.forEach((f, i) => {
      const errs = {};
      const minExp = parseFloat(f.minExperience);
      const maxExp = parseFloat(f.maxExperience);

      if (f.minExperience && isNaN(minExp)) {
        errs.minExperience = "Must be a number";
        valid = false;
      }
      if (f.maxExperience && isNaN(maxExp)) {
        errs.maxExperience = "Must be a number";
        valid = false;
      }
      if (f.minExperience && f.maxExperience && !isNaN(minExp) && !isNaN(maxExp) && minExp >= maxExp) {
        errs.minExperience = "Min experience must be less than max experience";
        valid = false;
      }

      const parsedMinSal = parseFloat(f.minSalary.replace(/,/g, ""));
      const parsedMaxSal = parseFloat(f.maxSalary.replace(/,/g, ""));
      if (f.minSalary && isNaN(parsedMinSal)) {
        errs.minSalary = "Must be a number";
        valid = false;
      }
      if (f.maxSalary && isNaN(parsedMaxSal)) {
        errs.maxSalary = "Must be a number";
        valid = false;
      }
      const minSal = parseSalary(f.minSalary);
      const maxSal = parseSalary(f.maxSalary);
      if (f.minSalary && f.maxSalary && minSal > 0 && maxSal > 0 && minSal >= maxSal) {
        errs.minSalary = "Min salary must be less than max salary";
        valid = false;
      }
      if (Object.keys(errs).length > 0) errors[i] = errs;
    });
    setFormErrors(errors);
    return valid;
  };

  const removeForm = (index) => {
    setRoleForms((prev) => prev.filter((_, i) => i !== index));
  };

  const openNew = () => {
    setEditingId(null);
    setRoleForms([emptyForm()]);
    setShowForm(true);
  };

  const submitRequests = async () => {
    if (!validateForms()) return;
    const updatedForms = roleForms.map((f) => {
      const combinedSalary = f.minSalary && f.maxSalary ? `${f.minSalary}-${f.maxSalary}` : (f.minSalary || f.maxSalary || "");
      const combinedExperience = f.minExperience && f.maxExperience ? `${f.minExperience}-${f.maxExperience}` : (f.minExperience || f.maxExperience || "");
      return {
        ...f,
        salaryRange: combinedSalary,
        experience: combinedExperience,
      };
    });

    if (editingId !== null) {
      setRoleRequests((prev) => prev.map((r) => r.id === editingId ? { ...r, ...updatedForms[0] } : r));
      setApprovalRequests((prev) =>
        prev.map((apr) =>
          String(apr.sourceId) === String(editingId)
            ? {
                ...apr,
                dept: updatedForms[0].dept,
                role: updatedForms[0].role,
                experience: updatedForms[0].experience,
                salary: updatedForms[0].salaryRange ? `₹${updatedForms[0].salaryRange}` : "",
                just: updatedForms[0].just,
              }
            : apr
        )
      );
      setRoleForms([emptyForm()]);
      setShowForm(false);
      setEditingId(null);
      return;
    }

    // --- New submission: call the backend API ---
    const submittedBy = "HR Admin";
    setSubmitError("");
    setSubmitting(true);

    try {
      const now = new Date().toLocaleDateString();
      // Submit all forms to the backend concurrently
      const created = await Promise.all(
        updatedForms.map((f) => createRoleRequest(f, submittedBy))
      );

      const newRequests = updatedForms.map((f, i) => ({
        ...f,
        id: created[i].id,
        backendId: created[i].backendId,
        status: created[i].status || "Pending",
        submittedBy: created[i].submittedBy || submittedBy,
        date: created[i].date || now,
        requestType: "Role",
        history: [{ act: "Submitted", by: submittedBy, date: now, note: "" }],
      }));

      setRoleRequests((prev) => [...prev, ...newRequests]);
      setApprovalRequests((prev) => [
        ...prev,
        ...newRequests.map((r) => ({
          id: `APR-${Date.now()}-${Math.random()}`,
          dept: r.dept,
          role: r.role,
          experience: r.experience,
          requestedBy: submittedBy,
          date: r.date,
          salary: r.salaryRange ? `₹${r.salaryRange}` : "",
          just: r.just,
          status: "Pending",
          comment: "",
          history: r.history,
          sourceId: r.id,
          type: "Role Request",
        })),
      ]);

      setRoleForms([emptyForm()]);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error("Submit role request error:", err);
      setSubmitError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveRoleRequestEdits = (submitAsPending) => {
    if (!selectedRequest) return;
    const minS = selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const maxS = selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const minE = selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0]?.trim() ?? "";
    const maxE = selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1]?.trim() ?? "";

    const combinedSalary = minS && maxS ? `${minS}-${maxS}` : (minS || maxS || "");
    const combinedExperience = minE && maxE ? `${minE}-${maxE}` : (minE || maxE || "");

    const updated = {
      ...selectedRequest,
      salaryRange: combinedSalary,
      experience: combinedExperience,
      status: submitAsPending ? "Pending" : selectedRequest.status,
    };

    delete updated.minSalary;
    delete updated.maxSalary;
    delete updated.minExperience;
    delete updated.maxExperience;

    setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(selectedRequest.id)
          ? {
              ...apr,
              dept: updated.dept,
              role: updated.role,
              experience: updated.experience,
              salary: updated.salaryRange ? `₹${updated.salaryRange}` : "",
              just: updated.just,
              status: updated.status,
            }
          : apr
      )
    );

    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const hasChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    const currMinSal = selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const currMaxSal = selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const currMinExp = selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0]?.trim() ?? "";
    const currMaxExp = selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1]?.trim() ?? "";
    const origMinSal = originalRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const origMaxSal = originalRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const origMinExp = originalRequest.experience?.split("-")[0]?.trim() ?? "";
    const origMaxExp = originalRequest.experience?.split("-")[1]?.trim() ?? "";
    return (
      selectedRequest.dept !== originalRequest.dept ||
      selectedRequest.role !== originalRequest.role ||
      selectedRequest.just !== originalRequest.just ||
      currMinSal !== origMinSal ||
      currMaxSal !== origMaxSal ||
      currMinExp !== origMinExp ||
      currMaxExp !== origMaxExp
    );
  };

  const approveDirectly = () => {
    if (!selectedRequest) return;
    const now = new Date().toLocaleDateString();
    const entry = { act: "Approved", by: "HR Admin", date: now, note: "" };
    const updated = {
      ...selectedRequest,
      status: "Approved",
      history: [...(selectedRequest.history || []), entry],
    };
    delete updated.minSalary;
    delete updated.maxSalary;
    delete updated.minExperience;
    delete updated.maxExperience;

    setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(selectedRequest.id)
          ? { ...apr, status: "Approved", history: updated.history }
          : apr
      )
    );

    if (setExistingRoles) {
      setExistingRoles((prev) => {
        const exists = prev.some((x) => x.role === selectedRequest.role && x.dept === selectedRequest.dept);
        if (exists) return prev;
        const cleanedSalary = selectedRequest.salaryRange ? selectedRequest.salaryRange.replace(/^₹/, "") : "";
        return [...prev, {
          id: `ROL-${Date.now()}`, dept: selectedRequest.dept, role: selectedRequest.role, type: "Full-time",
          headcount: 1, filled: 0, currentFilled: 0, status: "Inactive", currentStatus: "Inactive",
          experience: selectedRequest.experience || "—",
          salaryRange: cleanedSalary || "—",
          category: selectedRequest.category || "—",
        }];
      });
    }

    if (onNavigateToExistingRoles) {
      setTimeout(() => { onNavigateToExistingRoles(); }, 300);
    }

    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const handleAccept = () => {
    if (hasChanges()) {
      saveRoleRequestEdits(true);
    } else {
      approveDirectly();
    }
  };

  const cancelRoleRequest = (reqId) => {
    setRoleRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "Cancelled" } : r))
    );
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(reqId) ? { ...apr, status: "Cancelled" } : apr
      )
    );
    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  return (
    <div>
      <SectionTitle
        title="Role Requests"
        sub="Raise role requests before creating job requests"
        action={<Btn label="+ New Role Request" onClick={openNew} />}
      />

      {/* Search Bar */}
      <div className="rr-search-bar">
        <Input
          placeholder="Search requests by role, department, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rr-search-input"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="rr-filter-tabs">
        {statuses.map((status) => {
          const count = counts[status];
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="rr-filter-btn"
              style={{
                background: isActive ? T.primary : T.white,
                color: isActive ? "#fff" : T.ink,
                border: `1.5px solid ${isActive ? T.primary : T.border}`,
              }}
            >
              {status}
              <span
                className="rr-filter-btn__count"
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : T.border,
                  color: isActive ? "#fff" : T.inkMid,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sent-Back Banners */}
      {roleRequests.filter((r) => r.status === "Sent Back").map((r) => (
        <div
          key={r.id}
          className="rr-sentback-banner"
          style={{ background: T.amberLight, border: `1px solid #FDE68A` }}
        >
          <div className="rr-sentback-banner__body">
            <strong className="rr-sentback-banner__label" style={{ color: T.amber }}>Action Required (Sent Back): </strong>
            <span className="rr-sentback-banner__text" style={{ color: T.ink }}>
              Request for <strong>{r.role}</strong> was returned with comment: <em>...</em>
            </span>
          </div>
          <Btn label="View Request" small variant="amber" onClick={() => { setSelectedRequest(r); setShowViewModal(true); }} />
        </div>
      ))}

      {/* New / Edit Form */}
      {showForm && (
        <div className="rr-form-wrapper">
          <Card style={{ padding: 0, overflow: "hidden", borderTop: `3px solid ${T.primary}`, marginBottom: 16 }}>
            <div className="rr-form-header">
              <div className="rr-form-header__icon">📂</div>
              <div className="rr-form-header__text">
                <div className="rr-form-header__title">
                  {editingId ? "Edit Role Request" : "New Role Request"}
                </div>
                <div className="rr-form-header__subtitle">
                  Provide job details and salary specifications to start the approval workflow.
                </div>
              </div>
            </div>

            <div className="rr-form-body">
              {roleForms.map((form, index) => (
                <Card key={form.id} hover={false} style={{ padding: 18, marginBottom: 16, border: `1px solid ${T.border}`, background: T.canvas }}>
                  <div className="rr-form-card-header">
                    <div className="rr-form-card-title" style={{ color: T.ink }}>
                      {editingId ? "Role Details" : `Role Request #${index + 1}`}
                    </div>
                    {roleForms.length > 1 && (
                      <button onClick={() => removeForm(index)} className="rr-form-remove-btn">
                        Remove
                      </button>
                    )}
                  </div>

                  <div className={`rr-form-grid-2col${isMobile ? " rr-form-grid-2col--mobile" : ""}`}>
                    <FormField label="Department" required>
                      <Input placeholder="Enter department" value={form.dept} onChange={(e) => updateForm(index, "dept", e.target.value)} />
                    </FormField>
                    <FormField label="Role Name" required>
                      <Input placeholder="Enter role" value={form.role} onChange={(e) => updateForm(index, "role", e.target.value)} />
                    </FormField>

                    <div className="rr-form-grid-half">
                      <FormField label="Min Experience (Yrs)" required>
                        <Input
                          placeholder="e.g. 2"
                          value={form.minExperience}
                          onChange={(e) => updateForm(index, "minExperience", e.target.value)}
                          style={formErrors[index]?.minExperience ? { borderColor: T.red } : {}}
                        />
                        {formErrors[index]?.minExperience && (
                          <div className="rr-form-error-text" style={{ color: T.red }}>
                            {formErrors[index].minExperience}
                          </div>
                        )}
                      </FormField>
                      <FormField label="Max Experience (Yrs)" required>
                        <Input
                          placeholder="e.g. 5"
                          value={form.maxExperience}
                          onChange={(e) => updateForm(index, "maxExperience", e.target.value)}
                          style={formErrors[index]?.maxExperience ? { borderColor: T.red } : {}}
                        />
                        {formErrors[index]?.maxExperience && (
                          <div className="rr-form-error-text" style={{ color: T.red }}>
                            {formErrors[index].maxExperience}
                          </div>
                        )}
                      </FormField>
                    </div>
                    <div className="rr-form-grid-half">
                      <FormField label="Min Salary (₹)" required>
                        <Input
                          placeholder="e.g. 40,000"
                          value={form.minSalary}
                          onChange={(e) => updateForm(index, "minSalary", e.target.value)}
                          style={formErrors[index]?.minSalary ? { borderColor: T.red } : {}}
                        />
                        {formErrors[index]?.minSalary && (
                          <div className="rr-form-error-text" style={{ color: T.red }}>
                            {formErrors[index].minSalary}
                          </div>
                        )}
                      </FormField>
                      <FormField label="Max Salary (₹)" required>
                        <Input
                          placeholder="e.g. 60,000"
                          value={form.maxSalary}
                          onChange={(e) => updateForm(index, "maxSalary", e.target.value)}
                          style={formErrors[index]?.maxSalary ? { borderColor: T.red } : {}}
                        />
                        {formErrors[index]?.maxSalary && (
                          <div className="rr-form-error-text" style={{ color: T.red }}>
                            {formErrors[index].maxSalary}
                          </div>
                        )}
                      </FormField>
                    </div>
                  </div>
                  <FormField label="Justification" required>
                    <Textarea
                      value={form.just}
                      onChange={(e) => updateForm(index, "just", e.target.value)}
                      placeholder="Why is this role needed?"
                      rows={3}
                    />
                  </FormField>
                </Card>
              ))}

              {submitError && (
                <div className="rr-submit-error">⚠ {submitError}</div>
              )}

              <div className="rr-form-actions" style={{ borderTop: `1px solid ${T.border}` }}>
                <Btn
                  label={submitting ? "Submitting…" : "Submit Request"}
                  onClick={submitRequests}
                  disabled={submitting}
                />
                {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setRoleForms((p) => [...p, emptyForm()])} />}
                <Btn label="Cancel" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setRoleForms([emptyForm()]); }} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {isMobile ? (
        <div className="rr-mobile-wrapper">
          <div className="rr-mobile-count" style={{ color: T.inkFaint }}>
            Showing {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + displayFiltered.length, totalItems)} of {totalItems} request{totalItems !== 1 ? "s" : ""}
          </div>

          <div
            ref={scrollRef}
            className="rr-mobile-scroll"
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const cardWidth = e.currentTarget.clientWidth;
              if (cardWidth > 0) {
                const newIndex = Math.round(scrollLeft / cardWidth);
                setCurrentCardIndex(newIndex);
              }
            }}
          >
            {displayFiltered.map((r, idx) => (
              <div
                key={r.id}
                className="rr-mobile-card"
                onClick={() => { setSelectedRequest(r); setOriginalRequest(r); setShowViewModal(true); }}
              >
                <div className="rr-mobile-card__counter">
                  {startIndex + idx + 1} of {totalItems}
                </div>

                <div>
                  <div className="rr-mobile-card__top">
                    <div className="rr-mobile-card__icon">📂</div>
                    <div className="rr-mobile-card__info">
                      <h3 className="rr-mobile-card__role">{r.role || "—"}</h3>
                      <div className="rr-mobile-card__dept">{r.dept || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="rr-mobile-card__details">
                  <div className="rr-mobile-card__grid">
                    <div>
                      <div className="rr-card-field__label">Request ID</div>
                      <div className="rr-card-field__value">{typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)}</div>
                    </div>
                    <div>
                      <div className="rr-card-field__label">Experience</div>
                      <div className="rr-card-field__value">{r.experience ? `${r.experience} yrs` : "—"}</div>
                    </div>
                    <div>
                      <div className="rr-card-field__label">Salary Range</div>
                      <div className="rr-card-field__value">{r.salaryRange ? `₹${r.salaryRange}` : "—"}</div>
                    </div>
                    <div>
                      <div className="rr-card-field__label">Date</div>
                      <div className="rr-card-field__value">{r.date || "—"}</div>
                    </div>
                  </div>

                  {r.just && (
                    <div className="rr-card-divider">
                      <div className="rr-card-field__label">Justification</div>
                      <div className="rr-card-just__text">{r.just}</div>
                    </div>
                  )}

                  <div className="rr-card-divider">
                    <div className="rr-card-status-row">
                      <div />
                      <div>
                        <div className="rr-card-status__label">Status</div>
                        <div className="rr-card-status__badge">
                          <Badge label={r.status} variant={statusVariant(r.status)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayFiltered.length > 0 && (
            <div className="rr-dots">
              {displayFiltered.map((_, i) => (
                <div
                  key={i}
                  className="rr-dot"
                  onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })}
                  style={{ background: currentCardIndex === i ? T.primary : T.border }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="rr-pagination">
              <button
                className="rr-pagination__btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                style={{
                  background: T.white,
                  color: activePage === 1 ? T.inkFaint : T.primary,
                  border: `1.5px solid ${activePage === 1 ? T.border : T.primary}`,
                  padding: "6px 12px",
                  fontSize: 12,
                }}
              >
                &larr; Prev 10
              </button>
              <span className="rr-pagination__page-label" style={{ fontSize: 12, color: T.inkMid }}>
                {activePage} / {totalPages}
              </span>
              <button
                className="rr-pagination__btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                style={{
                  background: activePage === totalPages ? T.white : T.primary,
                  color: activePage === totalPages ? T.inkFaint : T.white,
                  border: `1.5px solid ${activePage === totalPages ? T.border : T.primary}`,
                  padding: "6px 12px",
                  fontSize: 12,
                }}
              >
                Next 10 &rarr;
              </button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div className="rr-table-pager-row" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span className="rr-table-pager-label" style={{ color: T.inkFaint }}>
              Showing {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalItems)} of {totalItems}
            </span>
          </div>
          <Table
            onRowClick={(index) => {
              setSelectedRequest(displayFiltered[index]);
              setOriginalRequest(displayFiltered[index]);
              setShowViewModal(true);
            }}
            cols={["Request ID", "Department", "Role", "Experience", "Salary Range", "Justification", "Date", "Status"]}
            rows={displayFiltered.map((r) => {
              const ss = getStatusStyle(r.status);
              return [
                <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
                r.dept || "—",
                <strong>{r.role || "—"}</strong>,
                r.experience ? `${r.experience} yrs` : "—",
                r.salaryRange ? `₹${r.salaryRange}` : "—",
                <span className="rr-just-cell" style={{ color: T.inkLight }}>{r.just || "—"}</span>,
                r.date || "—",
                <span className="rr-status-badge" style={{ ...ss }}>{r.status}</span>,
              ];
            })}
          />
          {totalPages > 1 && (
            <div className="rr-pagination rr-pagination--desktop" style={{ borderTop: `1px solid ${T.border}` }}>
              <button
                className="rr-pagination__btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                style={{
                  background: T.white,
                  color: activePage === 1 ? T.inkFaint : T.primary,
                  border: `1.5px solid ${activePage === 1 ? T.border : T.primary}`,
                  padding: "8px 16px",
                  fontSize: 13,
                }}
              >
                &larr; Previous 10
              </button>
              <span className="rr-pagination__page-label" style={{ fontSize: 13, color: T.inkMid }}>
                Page {activePage} of {totalPages}
              </span>
              <button
                className="rr-pagination__btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                style={{
                  background: activePage === totalPages ? T.white : T.primary,
                  color: activePage === totalPages ? T.inkFaint : T.white,
                  border: `1.5px solid ${activePage === totalPages ? T.border : T.primary}`,
                  padding: "8px 16px",
                  fontSize: 13,
                }}
              >
                Next 10 &rarr;
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Detail View Modal */}
      {showViewModal && selectedRequest && (
        <div
          className="rr-modal-overlay"
          onClick={() => { setShowViewModal(false); setSelectedRequest(null); setOriginalRequest(null); }}
        >
          <div
            className="rr-modal-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.surface }}
          >
            {/* Modal Header */}
            <div
              className="rr-modal-header"
              style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}
            >
              <div>
                <div className="rr-modal-header__badges">
                  <Badge label="Role Request" variant="blue" />
                  <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
                </div>
                <div className="rr-modal-header__title" style={{ color: T.ink }}>
                  {selectedRequest.role || "Role Request Details"}
                </div>
                <div className="rr-modal-header__sub" style={{ color: T.inkLight }}>
                  {selectedRequest.dept && selectedRequest.dept !== "N/A" ? `${selectedRequest.dept} · ` : ""}{selectedRequest.date}
                </div>
              </div>
              <button
                className="rr-modal-close-btn"
                onClick={() => { setShowViewModal(false); setSelectedRequest(null); setOriginalRequest(null); }}
                style={{ background: T.canvas, border: `1px solid ${T.border}`, color: T.inkMid }}
              >×</button>
            </div>

            {/* Modal Body */}
            <div className="rr-modal-body">
              <div
                className="rr-modal-section"
                style={{ background: T.canvas, border: `1px solid ${T.border}` }}
              >
                {/* Department */}
                <div>
                  <div className="rr-field-label" style={{ color: T.inkFaint }}>Department</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      className="rr-field-input"
                      value={selectedRequest.dept || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, dept: e.target.value })}
                      placeholder="Department"
                      style={{ border: `1.5px solid ${T.border}`, background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div className="rr-field-value" style={{ color: T.ink }}>{selectedRequest.dept || "—"}</div>
                  )}
                </div>

                {/* Role Name */}
                <div>
                  <div className="rr-field-label" style={{ color: T.inkFaint }}>Role Name</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      className="rr-field-input"
                      value={selectedRequest.role || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, role: e.target.value })}
                      placeholder="Role Name"
                      style={{ border: `1.5px solid ${T.border}`, background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div className="rr-field-value" style={{ fontWeight: 700, color: T.ink }}>{selectedRequest.role || "—"}</div>
                  )}
                </div>

                {/* Salary Range */}
                <div>
                  <div className="rr-field-label" style={{ color: T.inkFaint }}>Salary Range</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div className="rr-range-grid">
                      <div>
                        <div className="rr-range-label" style={{ color: T.inkFaint }}>Min (₹)</div>
                        <input
                          className="rr-field-input"
                          value={selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, minSalary: e.target.value })}
                          placeholder="e.g. 40,000"
                          style={{ border: `1.5px solid ${T.border}`, background: T.surface, color: T.ink }}
                        />
                      </div>
                      <div>
                        <div className="rr-range-label" style={{ color: T.inkFaint }}>Max (₹)</div>
                        <input
                          className="rr-field-input"
                          value={selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, maxSalary: e.target.value })}
                          placeholder="e.g. 60,000"
                          style={{ border: `1.5px solid ${T.border}`, background: T.surface, color: T.ink }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rr-field-value" style={{ color: T.ink }}>₹{selectedRequest.salaryRange || "—"}</div>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <div className="rr-field-label" style={{ color: T.inkFaint }}>Experience</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div className="rr-range-grid">
                      <div>
                        <div className="rr-range-label" style={{ color: T.inkFaint }}>Min (yrs)</div>
                        <input
                          className="rr-field-input"
                          value={selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, minExperience: e.target.value })}
                          placeholder="e.g. 2"
                          style={{ border: `1.5px solid ${T.border}`, background: T.surface, color: T.ink }}
                        />
                      </div>
                      <div>
                        <div className="rr-range-label" style={{ color: T.inkFaint }}>Max (yrs)</div>
                        <input
                          className="rr-field-input"
                          value={selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, maxExperience: e.target.value })}
                          placeholder="e.g. 5"
                          style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.ink }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rr-field-value" style={{ color: T.ink }}>{selectedRequest.experience ? `${selectedRequest.experience} yrs` : "—"}</div>
                  )}
                </div>

                {/* Justification */}
                <div>
                  <div className="rr-field-label" style={{ color: T.inkFaint }}>Justification</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <textarea
                      className="rr-field-textarea"
                      value={selectedRequest.just || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, just: e.target.value })}
                      placeholder="Why is this role needed?"
                      style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div className="rr-field-value--just" style={{ color: T.ink }}>{selectedRequest.just}</div>
                  )}
                </div>
              </div>

              {/* History Timeline */}
              {selectedRequest.history?.length > 0 && (
                <div className="rr-history-section">
                  <div className="rr-history-label" style={{ color: T.inkFaint }}>Activity History</div>
                  {selectedRequest.history.map((h, i) => (
                    <div key={i} className="rr-history-item">
                      <div className="rr-history-timeline">
                        <div
                          className="rr-history-dot"
                          style={{ background: i === selectedRequest.history.length - 1 ? T.blue : T.border }}
                        />
                        {i < selectedRequest.history.length - 1 && (
                          <div className="rr-history-line" style={{ background: T.border }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < selectedRequest.history.length - 1 ? 4 : 0 }}>
                        <div className="rr-history-content__act" style={{ color: T.ink }}>
                          {h.act} <span className="rr-history-content__by" style={{ color: T.inkLight }}>by {h.by}</span>
                        </div>
                        <div className="rr-history-content__date" style={{ color: T.inkFaint }}>{h.date}</div>
                        {h.note && (
                          <div className="rr-history-note">{h.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {(selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back") && (
              <div
                className="rr-modal-footer"
                style={{ borderTop: `1px solid ${T.border}`, background: T.canvas }}
              >
                <Btn
                  label="Cancel Request"
                  variant="danger"
                  small
                  onClick={() => { cancelRoleRequest(selectedRequest.id); }}
                />
                <Btn
                  label={hasChanges() ? "Resubmit as New Request" : "Accept"}
                  variant="success"
                  small
                  onClick={handleAccept}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
