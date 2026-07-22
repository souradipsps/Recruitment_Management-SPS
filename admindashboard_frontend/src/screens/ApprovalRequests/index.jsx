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
  jobPostings,
  setJobPostings,
  setRoleRequests,
  setJobRequests,
  onNavigateToApplications,
  onNavigateToExistingRoles,
  currentUser,
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [sel, setSel]               = useState(null);
  const [comment, setComment]       = useState("");
  const [statusFilter, setStatusFilter] = useState("Approved");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch]         = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, search]);

  // Lock body scroll when modal is open.
  useEffect(() => {
    document.body.style.overflow = sel ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sel]);

  const openModal  = (r) => { setSel(r); setComment(""); setFieldErrors({}); };
  const closeModal = ()  => { setSel(null); setComment(""); setFieldErrors({}); };

  const { performAction, takeAction, isActionPending } = useApprovalActions({
    sel, setSel, comment, setFieldErrors, closeModal,
    setRequests, setRoleRequests, setJobRequests,
    setExistingRoles, setJobPostings,
    onNavigateToApplications, onNavigateToExistingRoles,
  });

  const filtered = requests
    .filter((r) => r.status === statusFilter)
    .filter((r) => {
      if (typeFilter === "All") {
        return true;
      }
      return r.type === typeFilter;
    })
    .filter((r) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      const terms = query.split(/\s+/);
      return terms.every((term) =>
        (r.role        || "").toLowerCase().includes(term) ||
        (r.dept        || "").toLowerCase().includes(term) ||
        (r.requestedBy || "").toLowerCase().includes(term)
      );
    });

  const ITEMS_PER_PAGE = 20;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayFiltered = filtered.slice(startIndex, endIndex);
 
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const pendingCount = pendingRequests.length;

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
        currentUser={currentUser}
        isActionPending={isActionPending}
      />

      {/* Top Card: Pending Requests */}
      <Card style={{ marginBottom: 24 }} hover={false}>
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: T.primaryPale,
        }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.primary }}>
            Pending Requests
          </h3>
          {pendingCount > 0 ? (
            <span style={{
              background: T.amberLight, border: `1px solid #FDE68A`,
              borderRadius: 99, padding: "4px 12px",
              fontSize: 11, fontWeight: 700, color: T.amber, whiteSpace: "nowrap",
            }}>
              {pendingCount} pending
            </span>
          ) : (
            <span style={{
              background: T.greenLight, border: `1px solid #A7F3D0`,
              borderRadius: 99, padding: "4px 12px",
              fontSize: 11, fontWeight: 700, color: T.green, whiteSpace: "nowrap",
            }}>
              All caught up
            </span>
          )}
        </div>

        {pendingCount === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 2 }}>All caught up!</div>
            <div style={{ fontSize: 12, color: T.inkLight }}>No pending requests requiring your review.</div>
          </div>
        ) : isMobile ? (
          <ApprovalListMobile filtered={pendingRequests} openModal={openModal} performAction={performAction} isActionPending={isActionPending} />
        ) : (
          <ApprovalListDesktop filtered={pendingRequests} openModal={openModal} performAction={performAction} isActionPending={isActionPending} />
        )}
      </Card>

      {/* Bottom Card: Request History / Filtered List */}
      <Card hover={false}>
        <div style={{
          padding: "16px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.ink }}>
            Request History & Filters
          </h3>
        </div>

        <ApprovalFilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          pendingCount={0}
          isMobile={isMobile}
        />

        {totalItems === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>No requests found</div>
            <div style={{ fontSize: 13, color: T.inkLight }}>No requests match the selected filters.</div>
          </div>
        ) : isMobile ? (
          <ApprovalListMobile filtered={displayFiltered} openModal={openModal} performAction={performAction} isActionPending={isActionPending} />
        ) : (
          <ApprovalListDesktop filtered={displayFiltered} openModal={openModal} performAction={performAction} isActionPending={isActionPending} />
        )}
 
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
    </div>
  );
}
