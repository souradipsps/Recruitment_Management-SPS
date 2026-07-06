import { useState, useEffect } from "react";
import { T } from "../../theme";
import { useBreakpoint } from "../../hooks";
import { Card, SectionTitle } from "../../components/ui";
import { useApprovalActions } from "./useApprovalActions";
import ApprovalModal from "./ApprovalModal";
import ApprovalFilterBar from "./ApprovalFilterBar";
import ApprovalListDesktop from "./ApprovalListDesktop";
import ApprovalListMobile from "./ApprovalListMobile";

/**
 * Approval Requests screen.
 * Composes FilterBar, Modal, and the responsive list (Desktop / Mobile).
 * Business logic lives in useApprovalActions.
 */
export default function ApprovalRequests({
  requests,
  setRequests,
  existingRoles,
  setExistingRoles,
  setJobPostings,
  setRoleRequests,
  setJobRequests,
  onNavigateToApplications,
  onNavigateToExistingRoles,
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [sel, setSel]               = useState(null);
  const [comment, setComment]       = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [search, setSearch]         = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Lock body scroll when modal is open.
  useEffect(() => {
    document.body.style.overflow = sel ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sel]);

  const openModal  = (r) => { setSel(r); setComment(""); setFieldErrors({}); };
  const closeModal = ()  => { setSel(null); setComment(""); setFieldErrors({}); };

  const { performAction, takeAction } = useApprovalActions({
    sel, setSel, comment, setFieldErrors, closeModal,
    setRequests, setRoleRequests, setJobRequests,
    setExistingRoles, setJobPostings,
    onNavigateToApplications, onNavigateToExistingRoles,
  });

  const filtered = requests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.role        || "").toLowerCase().includes(q) ||
        (r.dept        || "").toLowerCase().includes(q) ||
        (String(r.sourceId) || "").toLowerCase().includes(q) ||
        (r.requestedBy || "").toLowerCase().includes(q) ||
        (r.date        || "").toLowerCase().includes(q)
      );
    });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const isPending    = sel?.status === "Pending";

  return (
    <div>
      <SectionTitle title="Approve Request" sub="Review, approve, or return pending role and job requests" />

      {/* Detail / action modal */}
      <ApprovalModal
        sel={sel}
        setSel={setSel}
        closeModal={closeModal}
        isPending={isPending}
        comment={comment}
        setComment={setComment}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        takeAction={takeAction}
        isMobile={isMobile}
        existingRoles={existingRoles}
      />

      <Card>
        <ApprovalFilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          pendingCount={pendingCount}
          isMobile={isMobile}
        />

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>No requests yet</div>
            <div style={{ fontSize: 13, color: T.inkLight }}>Submit a Role or Job Request to see it here for approval.</div>
          </div>
        ) : isMobile ? (
          <ApprovalListMobile filtered={filtered} openModal={openModal} performAction={performAction} />
        ) : (
          <ApprovalListDesktop filtered={filtered} openModal={openModal} performAction={performAction} />
        )}
      </Card>
    </div>
  );
}
