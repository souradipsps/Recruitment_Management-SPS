import { useState, useRef } from "react";
import { emptyForm } from "./jobRequestUtils";
import { createJobRequest, updateJobRequestStatus } from "../../api/jobRequestsApi";

const STATUSES = ["All", "Pending", "Approved", "Rejected", "Cancelled", "Sent Back"];

export function useJobRequests({ jobRequests, setJobRequests, setApprovalRequests, setJobPostings, existingRoles, onNavigateToApplications, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [jobForms, setJobForms] = useState([emptyForm()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [originalRequest, setOriginalRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef(null);

  const filteredRequests = jobRequests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => {
      const query = search.toLowerCase();
      return (
        (r.role || "").toLowerCase().includes(query) ||
        (r.location || "").toLowerCase().includes(query) ||
        (String(r.id) || "").toLowerCase().includes(query)
      );
    });

  const counts = STATUSES.reduce((acc, status) => {
    acc[status] = status === "All"
      ? jobRequests.length
      : jobRequests.filter((r) => r.status === status).length;
    return acc;
  }, {});

  // Only Active roles are eligible to be requested against.
  const isActiveRole = (r) => (r.currentStatus || r.status) === "Active";

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

  const openView = (r) => {
    setSelectedRequest(r);
    setOriginalRequest(r);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const updateForm = (index, key, value) => {
    setJobForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleDepartmentChange = (index, department) => {
    setJobForms((prev) =>
      prev.map((f, i) => (i === index ? { ...f, department, role: "", exp: "", salary: "", type: "" } : f)),
    );
  };

  const handleRoleChange = (index, selectedRole) => {
    updateForm(index, "role", selectedRole);
    const department = jobForms[index]?.department;
    const matchingRole = (existingRoles || []).find(
      (r) => r.role === selectedRole && (!department || r.dept === department),
    );
    if (matchingRole) {
      updateForm(index, "exp", matchingRole.experience || "");
      updateForm(index, "salary", matchingRole.salaryRange || "");
      updateForm(index, "type", matchingRole.type || "");
    }
  };

  const handleDepartmentChangeInModal = (department) => {
    if (!selectedRequest) return;
    setSelectedRequest({ ...selectedRequest, department, role: "", exp: "", salary: "", type: "" });
  };

  const handleRoleChangeInModal = (selectedRole) => {
    if (!selectedRequest) return;
    const matchingRole = (existingRoles || []).find(
      (r) => r.role === selectedRole && (!selectedRequest.department || r.dept === selectedRequest.department),
    );
    setSelectedRequest({
      ...selectedRequest,
      role: selectedRole,
      exp: matchingRole ? (matchingRole.experience || "") : selectedRequest.exp,
      salary: matchingRole ? (matchingRole.salaryRange || "") : selectedRequest.salary,
      type: matchingRole ? (matchingRole.type || "") : selectedRequest.type,
    });
  };

  const saveJobRequestEdits = (submitAsPending) => {
    if (!selectedRequest) return;
    const updated = {
      ...selectedRequest,
      status: submitAsPending ? "Pending" : selectedRequest.status,
    };

    setJobRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(selectedRequest.id)
          ? {
              ...apr,
              department: updated.department,
              role: updated.role,
              location: updated.location,
              category: updated.category,
              salary: updated.salary,
              vacancies: updated.vacancies,
              exp: updated.exp,
              qual: updated.qual,
              empType: updated.type,
              just: updated.justification,
              description: updated.description,
              skills: updated.skills,
              status: updated.status,
            }
          : apr
      )
    );

    closeModal();
  };

  const hasChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    return (
      selectedRequest.department !== originalRequest.department ||
      selectedRequest.role !== originalRequest.role ||
      selectedRequest.location !== originalRequest.location ||
      selectedRequest.category !== originalRequest.category ||
      selectedRequest.vacancies !== originalRequest.vacancies ||
      selectedRequest.exp !== originalRequest.exp ||
      selectedRequest.qual !== originalRequest.qual ||
      selectedRequest.type !== originalRequest.type ||
      selectedRequest.salary !== originalRequest.salary ||
      selectedRequest.description !== originalRequest.description ||
      selectedRequest.justification !== originalRequest.justification ||
      JSON.stringify(selectedRequest.skills || []) !== JSON.stringify(originalRequest.skills || [])
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
    setJobRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(selectedRequest.id)
          ? { ...apr, status: "Approved", history: updated.history }
          : apr
      )
    );
    setJobPostings((prev) => {
      const alreadyExists = prev.some((p) => p.role === selectedRequest.role);
      if (alreadyExists) return prev;
      return [
        ...prev,
        {
          id: `POST-${Date.now()}`,
          role: selectedRequest.role,
          channel: "Career Page",
          status: "Unpublished",
          posted: now,
          expiry: "30 Days",
          apps: 0,
          location: selectedRequest.location || "",
          salary: selectedRequest.salary || "",
          vacancies: selectedRequest.vacancies || "",
          exp: selectedRequest.exp || "",
          qual: selectedRequest.qual || "",
          type: selectedRequest.type || "",
          description: selectedRequest.description || "",
        },
      ];
    });
    if (onNavigateToApplications) {
      setTimeout(() => { onNavigateToApplications(); }, 300);
    }
    closeModal();
  };

  const handleAccept = () => {
    if (hasChanges()) {
      saveJobRequestEdits(true);
    } else {
      approveDirectly();
    }
  };

  const cancelJobRequest = async (reqId) => {
    const target = jobRequests.find((r) => r.id === reqId);
    if (target && target.backendId != null) {
      try {
        await updateJobRequestStatus(target.backendId, "Cancelled");
      } catch (err) {
        console.error("Failed to cancel job request on backend:", err);
        alert(`Could not cancel request: ${err.message}`);
        return;
      }
    }

    setJobRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "Cancelled" } : r))
    );
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(reqId) ? { ...apr, status: "Cancelled" } : apr
      )
    );
    closeModal();
  };

  const openNew = () => {
    setEditingId(null);
    setJobForms([emptyForm()]);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setJobForms([emptyForm()]);
  };

  const submitRequests = async () => {
    if (editingId !== null) {
      setJobRequests((prev) => prev.map((r) => r.id === editingId ? { ...r, ...jobForms[0] } : r));
      setApprovalRequests((prev) =>
        prev.map((apr) =>
          String(apr.sourceId) === String(editingId)
            ? {
                ...apr,
                department: jobForms[0].department,
                role: jobForms[0].role,
                location: jobForms[0].location,
                category: jobForms[0].category,
                salary: jobForms[0].salary,
                vacancies: jobForms[0].vacancies,
                exp: jobForms[0].exp,
                qual: jobForms[0].qual,
                empType: jobForms[0].type,
                just: jobForms[0].justification,
                description: jobForms[0].description,
                skills: jobForms[0].skills,
              }
            : apr
        )
      );
      setJobForms([emptyForm()]);
      setShowForm(false);
      setEditingId(null);
      return;
    }

    const submittedBy = currentUser?.name || currentUser?.email || "Admin";
    setSubmitError("");
    setSubmitting(true);
    
    try {
      const now = new Date().toLocaleDateString();
      // Send all forms to backend via API concurrently
      const created = await Promise.all(jobForms.map(f => createJobRequest(f, submittedBy)));
      
      const newRequests = jobForms.map((f, i) => ({
        ...f,
        id: created[i].id || `JR-${Date.now()}-${i}`,
        requestId: created[i].request_id,
        status: created[i].status || "Pending",
        submittedBy: created[i].submittedBy || submittedBy,
        comment: "",
        date: now,
        history: [{ act: "Submitted", by: submittedBy, date: now, note: "" }],
      }));

      setJobRequests((prev) => [...prev, ...newRequests]);
      setApprovalRequests((prev) => [
        ...prev,
        ...newRequests.map((r) => ({
          id: `APR-${Date.now()}-${Math.random()}`,
          dept: r.department || "N/A",
          role: r.role,
          category: r.category || "N/A",
          requestedBy: r.submittedBy || submittedBy,
          date: now,
          location: r.location,
          salary: r.salary,
          vacancies: r.vacancies,
          exp: r.exp,
          qual: r.qual,
          empType: r.type,
          just: r.justification,
          description: r.description,
          skills: r.skills,
          status: r.status || "Pending",
          comment: "",
          history: r.history || [{ act: "Submitted", by: submittedBy, date: now, note: "" }],
          sourceId: r.id,
          type: "Job Request",
        })),
      ]);
      setJobForms([emptyForm()]);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.message || "Failed to submit job request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // filter / search state
    statuses: STATUSES,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    counts,
    filteredRequests,
    // form state
    showForm,
    jobForms,
    setJobForms,
    editingId,
    openNew,
    cancelForm,
    submitRequests,
    submitting,
    submitError,
    updateForm,
    handleDepartmentChange,
    handleRoleChange,
    deptOptions,
    getRoleOptionsForDept,
    // modal state
    showViewModal,
    selectedRequest,
    setSelectedRequest,
    openView,
    closeModal,
    handleDepartmentChangeInModal,
    handleRoleChangeInModal,
    hasChanges,
    handleAccept,
    cancelJobRequest,
    // mobile carousel
    scrollRef,
    currentCardIndex,
    setCurrentCardIndex,
  };
}
