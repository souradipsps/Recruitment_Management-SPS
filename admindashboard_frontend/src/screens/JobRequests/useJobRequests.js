import { useState, useRef } from "react";
import { emptyForm } from "./jobRequestUtils";
import { createJobRequest, updateJobRequestStatus, updateJobRequestFields } from "../../api/jobRequestsApi";
import { fetchApprovals } from "../../api/approvalsApi";

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
  const [deptFilter, setDeptFilter] = useState("All");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef(null);

  const filteredRequests = jobRequests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => deptFilter === "All" || r.department === deptFilter)
    .filter((r) => {
      const query = search.toLowerCase();
      return (
        (r.role || "").toLowerCase().includes(query) ||
        (r.location || "").toLowerCase().includes(query) ||
        (String(r.id) || "").toLowerCase().includes(query)
      );
    });

  const counts = STATUSES.reduce((acc, status) => {
    const baseRequests = deptFilter === "All" ? jobRequests : jobRequests.filter((r) => r.department === deptFilter);
    acc[status] = status === "All"
      ? baseRequests.length
      : baseRequests.filter((r) => r.status === status).length;
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
      if (!department && matchingRole.dept) {
        updateForm(index, "department", matchingRole.dept);
      }
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
      department: (!selectedRequest.department && matchingRole) ? (matchingRole.dept || "") : selectedRequest.department,
      exp: matchingRole ? (matchingRole.experience || "") : selectedRequest.exp,
      salary: matchingRole ? (matchingRole.salaryRange || "") : selectedRequest.salary,
      type: matchingRole ? (matchingRole.type || "") : selectedRequest.type,
    });
  };

  // Re-fetches the authoritative approvals list and replaces all Job Request
  // entries with it. A single job request accumulates multiple ApprovalRequest
  // rows across resubmit cycles (one per cycle, created by jobs/signals.py),
  // all sharing the same sourceId. Patching approvals by sourceId in place
  // touches every one of those rows at once, so a resubmit/approve/cancel
  // wrongly flips historical rows too and produces duplicate/stale cards until
  // a hard refresh. Refetching mirrors exactly which rows the backend reports.
  const refreshJobRequestApprovals = async () => {
    try {
      const freshApprovals = await fetchApprovals();
      const freshJobRequestApprovals = freshApprovals.filter((a) => a.type === "Job Request");
      setApprovalRequests((prev) => [
        ...prev.filter((a) => a.type !== "Job Request"),
        ...freshJobRequestApprovals,
      ]);
    } catch (err) {
      console.error("Failed to refresh approvals:", err);
    }
  };

  // Updates the existing Sent-Back request in place (same id/backendId) with
  // the edited fields and resubmits it as Pending, instead of creating a
  // separate new request. Note: the request's linked Approval record was
  // already processed by the backend and there's no documented "reopen"
  // endpoint for it — re-fetching approvals below reflects whatever the
  // backend actually reports for that Approval after this update.
  const saveJobRequestEdits = async () => {
    if (!selectedRequest) return;

    if (selectedRequest.backendId == null) {
      alert("This request has no backend record yet — reload the page and try again.");
      return;
    }

    try {
      await updateJobRequestFields(selectedRequest.backendId, selectedRequest);
      await updateJobRequestStatus(selectedRequest.backendId, "Pending");
    } catch (err) {
      console.error("Failed to update job request:", err);
      alert(`Could not update request: ${err.message}`);
      return;
    }

    const now = new Date().toLocaleDateString();
    const submittedBy = currentUser?.name || currentUser?.email || "Admin";
    const entry = { act: "Resubmitted", by: submittedBy, date: now, note: "" };
    const updated = {
      ...selectedRequest,
      status: "Pending",
      history: [...(selectedRequest.history || []), entry],
    };

    setJobRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? updated : r)));

    // Re-fetch real approvals instead of fabricating a local stand-in (same
    // reasoning as submitRequests: a fabricated entry has no backendId).
    await refreshJobRequestApprovals();

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

  const approveDirectly = async () => {
    if (!selectedRequest) return;
    if (selectedRequest.backendId == null) {
      alert("This request has no backend record yet — reload the page and try again.");
      return;
    }

    try {
      await updateJobRequestStatus(selectedRequest.backendId, "Approved");
    } catch (err) {
      console.error("Failed to approve job request:", err);
      alert(`Could not approve request: ${err.message}`);
      return;
    }

    const now = new Date().toLocaleDateString();
    const entry = { act: "Approved", by: "HR Admin", date: now, note: "" };
    const updated = {
      ...selectedRequest,
      status: "Approved",
      history: [...(selectedRequest.history || []), entry],
    };
    setJobRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));
    await refreshJobRequestApprovals();
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
      saveJobRequestEdits();
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
    await refreshJobRequestApprovals();
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
        backendId: created[i].backendId,
        requestId: created[i].request_id,
        status: created[i].status || "Pending",
        submittedBy: created[i].submittedBy || submittedBy,
        comment: "",
        date: now,
        history: [{ act: "Submitted", by: submittedBy, date: now, note: "" }],
      }));

      setJobRequests((prev) => [...prev, ...newRequests]);

      // The backend auto-creates the corresponding Approval record(s) for each
      // Job Request. Re-fetch the real list instead of fabricating local
      // stand-ins here — a fabricated entry has no backendId, so approving/
      // rejecting it silently no-ops against the API while a duplicate,
      // backend-sourced entry (with a real backendId) does update the database.
      await refreshJobRequestApprovals();

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

  const filterDeptOptions = [
    { value: "All", label: "All Departments" },
    ...[
      ...new Set([
        ...jobRequests.map((r) => r.department).filter(Boolean),
        ...(existingRoles || []).filter(isActiveRole).map((r) => r.dept).filter(Boolean),
      ])
    ].sort().map((d) => ({ value: d, label: d }))
  ];

  return {
    // filter / search state
    statuses: STATUSES,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    counts,
    filteredRequests,
    deptFilter,
    setDeptFilter,
    filterDeptOptions,
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
