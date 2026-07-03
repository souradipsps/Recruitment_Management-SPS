import { useState, useRef } from "react";
import { emptyForm } from "./jobRequestUtils";

const STATUSES = ["All", "Pending", "Approved", "Rejected", "Cancelled", "Sent Back"];

export function useJobRequests({ jobRequests, setJobRequests, setApprovalRequests, setJobPostings, existingRoles, onNavigateToApplications }) {
  const [showForm, setShowForm] = useState(false);
  const [jobForms, setJobForms] = useState([emptyForm()]);
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

  const roleOptions = (existingRoles || []).map((r) => ({ value: r.role, label: r.role }));

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

  const handleRoleChange = (index, selectedRole) => {
    updateForm(index, "role", selectedRole);
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRole);
    if (matchingRole) {
      updateForm(index, "exp", matchingRole.experience || "");
      updateForm(index, "salary", matchingRole.salaryRange || "");
    }
  };

  const handleRoleChangeInModal = (selectedRole) => {
    if (!selectedRequest) return;
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRole);
    setSelectedRequest({
      ...selectedRequest,
      role: selectedRole,
      exp: matchingRole ? (matchingRole.experience || "") : selectedRequest.exp,
      salary: matchingRole ? (matchingRole.salaryRange || "") : selectedRequest.salary,
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

  const cancelJobRequest = (reqId) => {
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

  const submitRequests = () => {
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
    } else {
      const now = new Date().toLocaleDateString();
      const newRequests = jobForms.map((f, i) => ({
        ...f,
        id: `JR-${Date.now()}-${i}`,
        status: "Pending",
        comment: "",
        date: now,
        history: [{ act: "Submitted", by: "Current User", date: now, note: "" }],
      }));
      setJobRequests((prev) => [...prev, ...newRequests]);
      setApprovalRequests((prev) => [
        ...prev,
        ...newRequests.map((r) => ({
          id: `APR-${Date.now()}-${Math.random()}`,
          dept: r.department || "N/A",
          role: r.role,
          category: r.category || "N/A",
          requestedBy: "Current User",
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
          status: "Pending",
          comment: "",
          history: [{ act: "Submitted", by: "Current User", date: now, note: "" }],
          sourceId: r.id,
          type: "Job Request",
        })),
      ]);
    }
    setJobForms([emptyForm()]);
    setShowForm(false);
    setEditingId(null);
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
    updateForm,
    handleRoleChange,
    roleOptions,
    // modal state
    showViewModal,
    selectedRequest,
    setSelectedRequest,
    openView,
    closeModal,
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
