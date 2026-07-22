import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Btn, Input, Badge, FormField, Modal, ModalHeader, Textarea, Select } from "../components/ui";
import { createRoleRequest, updateRoleRequest } from "../api/roleRequestsApi";
import { fetchApprovals } from "../api/approvalsApi";
import ActivityChatHistory from "../components/ActivityChatHistory";
import { TYPE_OPTIONS } from "../data";

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
  existing_role: null,
  variations: [
    {
      id: Date.now() + Math.random(),
      type: "",
      minExperience: "",
      maxExperience: "",
      minSalary: "",
      maxSalary: "",
    }
  ],
  just: "",
  date: new Date().toLocaleDateString(),
  status: "Pending",
  comment: "",
});

export default function RoleRequests({ roleRequests, setRoleRequests, setApprovalRequests, existingRoles, setExistingRoles, onNavigateToExistingRoles, currentUser, revisionRoleRequestData, setRevisionRoleRequestData }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  useEffect(() => {
    if (revisionRoleRequestData) {
      const data = revisionRoleRequestData;
      setEditingId(null);
      setRoleForms([
        {
          id: Date.now() + Math.random(),
          dept: data.dept || "",
          role: data.role || "",
          existing_role: data.backendId || null,
          variations: [
            {
              id: Date.now() + Math.random(),
              type: data.type || "Full-time",
              minExperience: data.experience ? String(data.experience).split("-")[0] || "" : "",
              maxExperience: data.experience ? String(data.experience).split("-")[1] || "" : "",
              minSalary: data.salaryRange ? String(data.salaryRange).split("-")[0] || "" : "",
              maxSalary: data.salaryRange ? String(data.salaryRange).split("-")[1] || "" : "",
            }
          ],
          just: `Request to revise parameter configurations for existing sanctioned role: ${data.role}.`,
          date: new Date().toLocaleDateString(),
          status: "Pending",
          comment: "",
        }
      ]);
      setSubmitError("");
      setShowForm(true);
      setRevisionRoleRequestData(null);
    }
  }, [revisionRoleRequestData]);

  const uniqueExistingRoles = Array.from(
    new Map((existingRoles || []).map((r) => [r.role.trim().toLowerCase(), r])).values()
  );

  const getSelectOptions = (form) => {
    const options = uniqueExistingRoles.map((r) => ({
      value: String(r.backendId),
      label: `Existing: ${r.role} (${r.dept})`,
    }));
    if (form.existing_role) {
      const exists = options.some((opt) => opt.value === String(form.existing_role));
      if (!exists) {
        const matchingRole = existingRoles.find((r) => String(r.backendId) === String(form.existing_role));
        if (matchingRole) {
          options.unshift({
            value: String(matchingRole.backendId),
            label: `Existing: ${matchingRole.role} (${matchingRole.dept}) [${matchingRole.type}, ${matchingRole.experience} yrs]`,
          });
        }
      }
    }
    options.push({ value: "NEW_ROLE", label: "➕ Request New Role Name..." });
    return options;
  };

  const handleSelectRoleOption = (index, val) => {
    if (val === "NEW_ROLE") {
      updateForm(index, "existing_role", null);
      updateForm(index, "role", "");
    } else {
      const selected = existingRoles.find((r) => String(r.backendId) === String(val));
      if (selected) {
        updateForm(index, "existing_role", selected.backendId);
        updateForm(index, "role", selected.role);
        updateForm(index, "dept", selected.dept);
      }
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [roleForms, setRoleForms] = useState([emptyForm()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [originalRequest, setOriginalRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);
  const scrollRef = useRef(null);
  useEffect(() => {
    const scrollContainer = document.querySelector(".animate-fade-in-up");
    if (showViewModal) {
      document.body.style.overflow = "hidden";
      if (scrollContainer) {
        scrollContainer.style.overflowY = "hidden";
      }
    } else {
      document.body.style.overflow = "";
      if (scrollContainer) {
        scrollContainer.style.overflowY = "auto";
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (scrollContainer) {
        scrollContainer.style.overflowY = "auto";
      }
    };
  }, [showViewModal]);

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

  const ITEMS_PER_PAGE = 20;
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayRequests = filteredRequests.slice(startIndex, endIndex);

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
      if (updated[index] && updated[index][key]) {
        const fieldErrors = { ...updated[index] };
        delete fieldErrors[key];
        updated[index] = fieldErrors;
      }
      return updated;
    });
  };

  const updateVariation = (index, vIndex, key, value) => {
    setRoleForms((prev) => prev.map((f, i) => {
      if (i !== index) return f;
      const updatedVars = f.variations.map((v, vi) => vi === vIndex ? { ...v, [key]: value } : v);
      return { ...f, variations: updatedVars };
    }));
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (updated[index] && updated[index].variations && updated[index].variations[vIndex]) {
        const fieldErrors = { ...updated[index] };
        const updatedVars = { ...fieldErrors.variations };
        if (updatedVars[vIndex]) {
          const varErrors = { ...updatedVars[vIndex] };
          delete varErrors[key];
          updatedVars[vIndex] = varErrors;
          fieldErrors.variations = updatedVars;
          updated[index] = fieldErrors;
        }
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
      
      if (!f.dept || !f.dept.trim()) {
        errs.dept = "Department is required";
        valid = false;
      }
      if (!f.role || !f.role.trim()) {
        errs.role = "Role name is required";
        valid = false;
      }

      if (!f.just || !f.just.trim()) {
        errs.just = "Justification is required";
        valid = false;
      }

      const variationsErrors = {};
      const variations = f.variations || [];
      variations.forEach((v, vi) => {
        const vErrs = {};
        if (!v.type || !v.type.trim()) {
          vErrs.type = "Employee type is required";
          valid = false;
        }

        const minExp = parseFloat(v.minExperience);
        const maxExp = parseFloat(v.maxExperience);

        if (!v.minExperience || !v.minExperience.trim()) {
          vErrs.minExperience = "Min experience is required";
          valid = false;
        } else if (isNaN(minExp)) {
          vErrs.minExperience = "Must be a number";
          valid = false;
        }
        
        if (!v.maxExperience || !v.maxExperience.trim()) {
          vErrs.maxExperience = "Max experience is required";
          valid = false;
        } else if (isNaN(maxExp)) {
          vErrs.maxExperience = "Must be a number";
          valid = false;
        }
        
        if (v.minExperience && v.maxExperience && !isNaN(minExp) && !isNaN(maxExp) && minExp >= maxExp) {
          vErrs.minExperience = "Min experience must be less than max experience";
          valid = false;
        }

        const cleanMinSalary = (v.minSalary || "").replace(/,/g, "");
        const cleanMaxSalary = (v.maxSalary || "").replace(/,/g, "");
        const parsedMinSal = parseFloat(cleanMinSalary);
        const parsedMaxSal = parseFloat(cleanMaxSalary);

        if (!v.minSalary || !v.minSalary.trim()) {
          vErrs.minSalary = "Min salary is required";
          valid = false;
        } else if (isNaN(parsedMinSal)) {
          vErrs.minSalary = "Must be a number";
          valid = false;
        }
        
        if (!v.maxSalary || !v.maxSalary.trim()) {
          vErrs.maxSalary = "Max salary is required";
          valid = false;
        } else if (isNaN(parsedMaxSal)) {
          vErrs.maxSalary = "Must be a number";
          valid = false;
        }
        
        const minSal = parseSalary(v.minSalary);
        const maxSal = parseSalary(v.maxSalary);
        if (v.minSalary && v.maxSalary && minSal > 0 && maxSal > 0 && minSal >= maxSal) {
          vErrs.minSalary = "Min salary must be less than max salary";
          valid = false;
        }

        if (Object.keys(vErrs).length > 0) {
          variationsErrors[vi] = vErrs;
        }
      });

      if (Object.keys(variationsErrors).length > 0) {
        errs.variations = variationsErrors;
      }

      if (Object.keys(errs).length > 0) errors[i] = errs;
    });
    setFormErrors(errors);
    return valid;
  };

  const removeForm = (index) => {
    setRoleForms((prev) => prev.filter((_, i) => i !== index));
    setFormErrors((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        const idx = parseInt(key, 10);
        if (idx > index) {
          updated[idx - 1] = prev[key];
        } else if (idx < index) {
          updated[idx] = prev[key];
        }
      });
      return updated;
    });
  };

  const addFormVariation = (index) => {
    const sourceForm = roleForms[index];
    const newForm = {
      ...emptyForm(),
      id: Date.now() + Math.random(),
      dept: sourceForm.dept,
      role: sourceForm.role,
      just: sourceForm.just,
    };
    setRoleForms((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newForm);
      return updated;
    });
    setFormErrors((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        const idx = parseInt(key, 10);
        if (idx > index) {
          updated[idx + 1] = prev[key];
        } else {
          updated[idx] = prev[key];
        }
      });
      return updated;
    });
  };

  const addVariation = (index) => {
    setRoleForms((prev) => prev.map((f, i) => {
      if (i !== index) return f;
      return {
        ...f,
        variations: [
          ...f.variations,
          {
            id: Date.now() + Math.random(),
            type: "",
            minExperience: "",
            maxExperience: "",
            minSalary: "",
            maxSalary: "",
          }
        ]
      };
    }));
  };

  const removeVariation = (index, vIndex) => {
    setRoleForms((prev) => prev.map((f, i) => {
      if (i !== index) return f;
      return {
        ...f,
        variations: f.variations.filter((_, vi) => vi !== vIndex)
      };
    }));
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (updated[index] && updated[index].variations) {
        const vars = updated[index].variations;
        const newVars = {};
        Object.keys(vars).forEach((key) => {
          const vi = parseInt(key, 10);
          if (vi > vIndex) {
            newVars[vi - 1] = vars[key];
          } else if (vi < vIndex) {
            newVars[vi] = vars[key];
          }
        });
        updated[index] = { ...updated[index], variations: newVars };
      }
      return updated;
    });
  };

  const openNew = () => {
    setEditingId(null);
    setRoleForms([emptyForm()]);
    setSubmitError("");
    setShowForm(true);
  };

  const submitRequests = async () => {
    if (!validateForms()) return;
    
    const updatedForms = roleForms.map((f) => {
      const parsedVariations = f.variations.map((v) => {
        const cleanMinSalary = (v.minSalary || "").replace(/,/g, "");
        const cleanMaxSalary = (v.maxSalary || "").replace(/,/g, "");
        const combinedSalary = cleanMinSalary && cleanMaxSalary ? `${cleanMinSalary}-${cleanMaxSalary}` : (cleanMinSalary || cleanMaxSalary || "");
        const combinedExperience = v.minExperience && v.maxExperience ? `${v.minExperience}-${v.maxExperience}` : (v.minExperience || v.maxExperience || "");
        return {
          ...v,
          salaryRange: combinedSalary,
          experience: combinedExperience,
        };
      });
      return {
        ...f,
        variations: parsedVariations,
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
                category: updatedForms[0].category,
              }
            : apr
        )
      );
      setRoleForms([emptyForm()]);
      setShowForm(false);
      setEditingId(null);
      return;
    }

    const submittedBy = currentUser?.name || currentUser?.email || "HR Admin";
    setSubmitError("");
    setSubmitting(true);
    try {
      // Submit all role requests sequentially to prevent ID collisions
      const created = [];
      for (const f of updatedForms) {
        const res = await createRoleRequest(f, submittedBy);
        created.push(res);
      }
      const now = new Date().toLocaleDateString();
      const newRequests = updatedForms.map((f, i) => ({
        ...f,
        id: created[i].id,
        backendId: created[i].backendId,
        status: created[i].status || "Pending",
        submittedBy: created[i].submittedBy || submittedBy,
        date: now,
        requestType: "Role",
        history: [{ act: "Submitted", by: submittedBy, date: now, note: "" }],
      }));
      setRoleRequests((prev) => [...prev, ...newRequests]);

      await refreshRoleRequestApprovals();

      setRoleForms([emptyForm()]);
      setShowForm(false);
      setEditingId(null);
      setSubmitSuccess("Role request submitted successfully.");
      setTimeout(() => setSubmitSuccess(""), 4000);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.message || "Failed to submit role request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // of just the currently active one.
  const refreshRoleRequestApprovals = async () => {
    try {
      const freshApprovals = await fetchApprovals();
      const freshRoleRequestApprovals = freshApprovals.filter((a) => a.type === "Role Request");
      setApprovalRequests((prev) => [
        ...prev.filter((a) => a.type !== "Role Request"),
        ...freshRoleRequestApprovals,
      ]);
    } catch (err) {
      console.error("Failed to refresh approvals:", err);
    }
  };

  const saveRoleRequestEdits = async (submitAsPending) => {
    if (!selectedRequest) return;
    if (!selectedRequest.backendId) {
      setModalError("This request has no backend record and cannot be saved.");
      return;
    }
    
    const formattedVariations = (selectedRequest.variations || []).map((v) => {
      const cleanMinSalary = (v.minSalary || "").replace(/,/g, "");
      const cleanMaxSalary = (v.maxSalary || "").replace(/,/g, "");
      const combinedSalary = cleanMinSalary && cleanMaxSalary ? `${cleanMinSalary}-${cleanMaxSalary}` : (cleanMinSalary || cleanMaxSalary || "");
      const combinedExperience = v.minExperience && v.maxExperience ? `${v.minExperience}-${v.maxExperience}` : (v.minExperience || v.maxExperience || "");
      return {
        type: v.type,
        experience: combinedExperience,
        salary_range: combinedSalary,
      };
    });

    const payload = {
      department: selectedRequest.dept,
      role: selectedRequest.role,
      justification: selectedRequest.just,
      status: submitAsPending ? "Pending" : selectedRequest.status,
      existing_role: selectedRequest.existing_role || null,
      variations: formattedVariations,
    };

    setModalError("");
    setModalSaving(true);
    try {
      const updated = await updateRoleRequest(selectedRequest.backendId, payload);
 
      setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));
 
      await refreshRoleRequestApprovals();
 
      setShowViewModal(false);
      setSelectedRequest(null);
      setOriginalRequest(null);
    } catch (err) {
      console.error("Failed to save role request edits:", err);
      setModalError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setModalSaving(false);
    }
  };
 
  const hasChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    const varChanged = JSON.stringify(selectedRequest.variations || []) !== JSON.stringify(originalRequest.variations || []);
    return (
      selectedRequest.dept !== originalRequest.dept ||
      selectedRequest.role !== originalRequest.role ||
      selectedRequest.just !== originalRequest.just ||
      varChanged
    );
  };

  const approveDirectly = async () => {
    if (!selectedRequest) return;
    if (!selectedRequest.backendId) {
      setModalError("This request has no backend record and cannot be approved.");
      return;
    }

    setModalError("");
    setModalSaving(true);
    try {
      const updated = await updateRoleRequest(selectedRequest.backendId, { status: "Approved" });

      setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));
      await refreshRoleRequestApprovals();

      if (setExistingRoles) {
        setExistingRoles((prev) => {
          const exists = prev.some((x) => x.role === updated.role && x.dept === updated.dept);
          if (exists) return prev;
          const cleanedSalary = updated.salaryRange ? updated.salaryRange.replace(/^₹/, "") : "";
          return [...prev, {
            id: `ROL-${Date.now()}`, dept: updated.dept, role: updated.role, type: updated.type || "Full-time",
            headcount: 1, filled: 0, currentFilled: 0, status: "Inactive", currentStatus: "Inactive",
            experience: updated.experience || "—",
            salaryRange: cleanedSalary || "—",
            category: updated.category || "—",
          }];
        });
      }

      if (onNavigateToExistingRoles) {
        setTimeout(() => { onNavigateToExistingRoles(); }, 300);
      }

      setShowViewModal(false);
      setSelectedRequest(null);
      setOriginalRequest(null);
    } catch (err) {
      console.error("Failed to approve role request:", err);
      setModalError(err.message || "Failed to approve. Please try again.");
    } finally {
      setModalSaving(false);
    }
  };

  const handleAccept = () => {
    if (hasChanges()) {
      saveRoleRequestEdits(true);
    } else {
      approveDirectly();
    }
  };

  const cancelRoleRequest = async (reqId) => {
    const target = roleRequests.find((r) => r.id === reqId);
    if (!target?.backendId) {
      setModalError("This request has no backend record and cannot be cancelled.");
      return;
    }

    setModalError("");
    setModalSaving(true);
    try {
      const updated = await updateRoleRequest(target.backendId, { status: "Cancelled" });
      setRoleRequests((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
      await refreshRoleRequestApprovals();
      setShowViewModal(false);
      setSelectedRequest(null);
      setOriginalRequest(null);
    } catch (err) {
      console.error("Failed to cancel role request:", err);
      setModalError(err.message || "Failed to cancel. Please try again.");
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div>
      <SectionTitle
        title="Role Requests"
        sub="Raise role requests before creating job requests"
        action={<Btn label="+ New Role Request" onClick={openNew} />}
      />

      {submitSuccess && (
        <div style={{ background: T.greenLight, border: `1px solid ${T.green}33`, color: T.green, padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          ✓ {submitSuccess}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Input
          placeholder="Search requests by role, department, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360, flex: 1 }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {statuses.map((status) => {
          const count = counts[status];
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                background: isActive ? T.primary : T.white,
                color: isActive ? "#fff" : T.ink,
                border: `1.5px solid ${isActive ? T.primary : T.border}`,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {status}
              <span
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : T.border,
                  color: isActive ? "#fff" : T.inkMid,
                  borderRadius: 99,
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {roleRequests.filter((r) => r.status === "Sent Back").map((r) => (
        <div
          key={r.id}
          style={{
            background: T.amberLight,
            border: `1px solid #FDE68A`,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <strong style={{ color: T.amber, fontSize: 13 }}>Action Required (Sent Back): </strong>
            <span style={{ fontSize: 13, color: T.ink }}>
              Request for <strong>{r.role}</strong> was returned with comment: <em>...</em>
            </span>
          </div>
          <Btn label="View Request" small variant="amber" onClick={() => { setSelectedRequest(r); setOriginalRequest(r); setModalError(""); setShowViewModal(true); }} />
        </div>
      ))}

      {showForm && (
        <div style={{ marginBottom: 20 }}>
          {roleForms.map((form, index) => (
            <Card key={form.id} hover={false} style={{ padding: 20, marginBottom: 16, borderTop: `3px solid ${T.blue}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
                    {editingId ? "Edit Role Request" : `Role Request #${index + 1}`}
                  </span>
                </div>
                {roleForms.length > 1 && (
                  <button onClick={() => removeForm(index)} style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormField label="Job Position / Title" required>
                  <Select
                    value={form.existing_role ? String(form.existing_role) : (form.role ? "NEW_ROLE" : "")}
                    onChange={(e) => handleSelectRoleOption(index, e.target.value)}
                    options={getSelectOptions(form)}
                    placeholder="Select an existing role / Request new title..."
                    style={formErrors[index]?.role ? { borderColor: T.red } : {}}
                  />
                  {formErrors[index]?.role && !form.role && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      {formErrors[index].role}
                    </div>
                  )}
                </FormField>

                <FormField label="Department" required>
                  <Input
                    placeholder="Enter department"
                    value={form.dept}
                    onChange={(e) => updateForm(index, "dept", e.target.value)}
                    disabled={!!form.existing_role}
                    style={formErrors[index]?.dept ? { borderColor: T.red } : {}}
                  />
                  {formErrors[index]?.dept && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      {formErrors[index].dept}
                    </div>
                  )}
                </FormField>
              </div>

              {(form.role && !form.existing_role || !form.existing_role) && (
                <div style={{ marginBottom: 14 }}>
                  <FormField label="New Job Role Title Name" required>
                    <Input
                      placeholder="Type the name of the new role"
                      value={form.role}
                      onChange={(e) => updateForm(index, "role", e.target.value)}
                      style={formErrors[index]?.role ? { borderColor: T.red } : {}}
                    />
                    {formErrors[index]?.role && (
                      <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                        {formErrors[index].role}
                      </div>
                    )}
                  </FormField>
                </div>
              )}

              {/* Variations Container */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 14 }}>
                {(form.variations || [form]).map((v, vIndex) => {
                  const varErrors = formErrors[index]?.variations?.[vIndex] || {};
                  const showRemoveVar = (form.variations && form.variations.length > 1);

                  return (
                    <div 
                      key={v.id || vIndex} 
                      style={{ 
                        background: T.canvas, 
                        border: `1.5px solid ${T.border}`, 
                        borderRadius: 12, 
                        padding: 16,
                        position: "relative"
                      }}
                    >
                      {showRemoveVar && (
                        <button
                          type="button"
                          onClick={() => removeVariation(index, vIndex)}
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            border: "none",
                            background: "#FEE2E2",
                            color: "#DC2626",
                            padding: "4px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 700,
                            zIndex: 2
                          }}
                        >
                          Remove Option
                        </button>
                      )}
                      
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <FormField label="Employee Type" required>
                          <Select
                            value={v.type}
                            onChange={(e) => updateVariation(index, vIndex, "type", e.target.value)}
                            options={TYPE_OPTIONS}
                            placeholder="Select type…"
                            style={varErrors.type ? { borderColor: T.red } : {}}
                          />
                          {varErrors.type && (
                            <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                              {varErrors.type}
                            </div>
                          )}
                        </FormField>
                        
                        <FormField label="Min Experience (Yrs)" required>
                          <Input
                            placeholder="e.g. 2"
                            value={v.minExperience}
                            onChange={(e) => updateVariation(index, vIndex, "minExperience", e.target.value)}
                            style={varErrors.minExperience ? { borderColor: T.red } : {}}
                          />
                          {varErrors.minExperience && (
                            <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                              {varErrors.minExperience}
                            </div>
                          )}
                        </FormField>
                        
                        <FormField label="Max Experience (Yrs)" required>
                          <Input
                            placeholder="e.g. 5"
                            value={v.maxExperience}
                            onChange={(e) => updateVariation(index, vIndex, "maxExperience", e.target.value)}
                            style={varErrors.maxExperience ? { borderColor: T.red } : {}}
                          />
                          {varErrors.maxExperience && (
                            <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                              {varErrors.maxExperience}
                            </div>
                          )}
                        </FormField>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        <FormField label="Min Salary (₹)" required>
                          <Input
                            placeholder="e.g. 40,000"
                            value={v.minSalary}
                            onChange={(e) => updateVariation(index, vIndex, "minSalary", e.target.value)}
                            style={varErrors.minSalary ? { borderColor: T.red } : {}}
                          />
                          {varErrors.minSalary && (
                            <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                              {varErrors.minSalary}
                            </div>
                          )}
                        </FormField>
                        <FormField label="Max Salary (₹)" required>
                          <Input
                            placeholder="e.g. 60,000"
                            value={v.maxSalary}
                            onChange={(e) => updateVariation(index, vIndex, "maxSalary", e.target.value)}
                            style={varErrors.maxSalary ? { borderColor: T.red } : {}}
                          />
                          {varErrors.maxSalary && (
                            <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                              {varErrors.maxSalary}
                            </div>
                          )}
                        </FormField>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Variation Button right below variations */}
              {!editingId && form.variations && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <button
                    type="button"
                    onClick={() => addVariation(index)}
                    style={{
                      border: "none",
                      background: T.skyLight,
                      color: T.sky,
                      padding: "8px 16px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.sky;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = T.skyLight;
                      e.currentTarget.style.color = T.sky;
                    }}
                  >
                    + Add Variation
                  </button>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <FormField label="Justification" required>
                  <textarea
                    value={form.just}
                    onChange={(e) => updateForm(index, "just", e.target.value)}
                    placeholder="Why is this role needed?"
                    style={{ width: "100%", minHeight: 100, border: `1.5px solid ${formErrors[index]?.just ? T.red : T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
                  />
                  {formErrors[index]?.just && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      {formErrors[index].just}
                    </div>
                  )}
                </FormField>
              </div>
            </Card>
          ))}

          {submitError && (
            <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", fontSize: 13, fontWeight: 600, border: "1px solid #FCA5A5" }}>
              {submitError}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <Btn label={submitting ? "Submitting..." : "Submit Request"} onClick={submitRequests} disabled={submitting} />
            {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setRoleForms((p) => [...p, emptyForm()])} disabled={submitting} />}
            <Btn label="Cancel" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setRoleForms([emptyForm()]); }} disabled={submitting} />
          </div>
        </div>
      )}

      {isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            Showing {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalItems)} of {totalItems} requests
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
            {displayRequests.map((r, idx) => {
              const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
              return (
                <div
                  key={r.id}
                  onClick={() => { setSelectedRequest(r); setOriginalRequest(r); setModalError(""); setShowViewModal(true); }}
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
                    {startIndex + idx + 1} of {totalItems}
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
                        📂
                      </div>
                      <div style={{ paddingRight: 64 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role || "—"}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                          {r.dept || "—"}
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
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Employee Type</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.type || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Experience</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.experience ? `${r.experience} yrs` : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Salary Range</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.salaryRange ? `₹${r.salaryRange}` : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Date</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.date || "—"}</div>
                      </div>
                    </div>

                    {r.just && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Justification</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.just}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div />
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
              {displayRequests.map((_, i) => (
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
      ) : (
        <Card>
          <Table
            onRowClick={(index) => {
              setSelectedRequest(displayRequests[index]);
              setOriginalRequest(displayRequests[index]);
              setModalError("");
              setShowViewModal(true);
            }}
            cols={["Request ID", "Department", "Role", "Employee Type", "Experience", "Salary Range", "Justification", "Status"]}
            rows={displayRequests.map((r) => {
              const ss = getStatusStyle(r.status);
              return [
                <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
                r.dept || "—",
                <strong>{r.role || "—"}</strong>,
                (r.variations || []).map((v) => v.type).filter(Boolean).join(", ") || r.type || "—",
                (r.variations || []).map((v) => v.experience ? `${v.experience} yrs` : "").filter(Boolean).join(", ") || (r.experience ? `${r.experience} yrs` : "—"),
                (r.variations || []).map((v) => v.salaryRange ? `₹${v.salaryRange}` : "").filter(Boolean).join(", ") || (r.salaryRange ? `₹${r.salaryRange}` : "—"),
                <span style={{ fontSize: 12, color: T.inkLight, maxWidth: 180, display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.just || "—"}</span>,
                <span style={{ ...ss, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{r.status}</span>,
              ];
            })}
          />

          {/* Desktop/Mobile Pagination Control */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "16px 20px",
              borderTop: `1px solid ${T.border}`,
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                style={{
                  background: T.white,
                  color: activePage === 1 ? T.inkFaint : T.primary,
                  border: `1.5px solid ${activePage === 1 ? T.border : T.primary}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: activePage === 1 ? "not-allowed" : "pointer",
                  opacity: activePage === 1 ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                &larr; Previous 20
              </button>

              <span style={{ fontSize: 13, color: T.inkMid, fontWeight: 600 }}>
                Page {activePage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                style={{
                  background: activePage === totalPages ? T.white : T.primary,
                  color: activePage === totalPages ? T.inkFaint : T.white,
                  border: `1.5px solid ${activePage === totalPages ? T.border : T.primary}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: activePage === totalPages ? "not-allowed" : "pointer",
                  opacity: activePage === totalPages ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                Next 20 &rarr;
              </button>
            </div>
          )}
        </Card>
      )}

      {showViewModal && selectedRequest && createPortal(
        <div
          onClick={() => { setShowViewModal(false); setSelectedRequest(null); setOriginalRequest(null); setModalError(""); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(15,23,42,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.surface, borderRadius: 16, width: "100%", maxWidth: 540,
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
                  <Badge label="Role Request" variant="blue" />
                  <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
                  {selectedRequest.role || "Role Request Details"}
                </div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {selectedRequest.dept && selectedRequest.dept !== "N/A" ? `${selectedRequest.dept} · ` : ""}{selectedRequest.date}
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setSelectedRequest(null); setOriginalRequest(null); setModalError(""); }}
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
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      value={selectedRequest.dept || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, dept: e.target.value })}
                      placeholder="Department"
                      style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.dept || "—"}</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role Name</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      value={selectedRequest.role || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, role: e.target.value })}
                      placeholder="Role Name"
                      style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.role || "—"}</div>
                  )}
                </div>



                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Variations (Type, Experience, Salary)</div>
                  
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(selectedRequest.variations || []).map((v, vIndex) => (
                        <div key={v.id || vIndex} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.canvas, position: "relative" }}>
                          {selectedRequest.variations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest((prev) => ({
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
                                setSelectedRequest((prev) => {
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
                                  setSelectedRequest((prev) => {
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
                                  setSelectedRequest((prev) => {
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
                                  setSelectedRequest((prev) => {
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
                                  setSelectedRequest((prev) => {
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
                          setSelectedRequest((prev) => ({
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
                      {(selectedRequest.variations || []).map((v, idx) => (
                        <div key={v.id || idx} style={{ fontSize: 13, fontWeight: 600, color: T.ink, padding: "4px 8px", background: T.canvas, borderRadius: 6 }}>
                          • <strong>{v.type || "Full-time"}</strong> ({v.experience ? `${v.experience} yrs` : "—"}) : {v.salaryRange ? `₹${v.salaryRange}` : "—"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Justification</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <textarea
                      value={selectedRequest.just || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, just: e.target.value })}
                      placeholder="Why is this role needed?"
                      style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.just}</div>
                  )}
                </div>
              </div>

              <ActivityChatHistory
                history={selectedRequest.history}
                currentUser={currentUser}
                justification={selectedRequest.just}
                requestedBy={selectedRequest.submittedBy}
              />
            </div>

            {(selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back") && (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", flexDirection: "column", gap: 10,
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                {modalError && (
                  <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                    {modalError}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <Btn
                    label="Cancel Request"
                    variant="danger"
                    small
                    disabled={modalSaving}
                    onClick={() => {
                      cancelRoleRequest(selectedRequest.id);
                    }}
                  />
                  <Btn
                    label={modalSaving ? "Saving..." : hasChanges() ? "Resubmit as New Request" : "Accept"}
                    variant="success"
                    small
                    disabled={modalSaving}
                    onClick={handleAccept}
                  />
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
