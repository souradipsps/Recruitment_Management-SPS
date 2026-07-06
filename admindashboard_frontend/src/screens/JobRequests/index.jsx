import { useState, useEffect } from "react";
import { useBreakpoint } from "../../hooks";
import { SectionTitle, Btn, Input } from "../../components/ui";
import { useJobRequests } from "./useJobRequests";
import { T } from "../../theme";
import JobRequestStatusFilter from "./JobRequestStatusFilter";
import JobRequestSentBackBanner from "./JobRequestSentBackBanner";
import JobRequestForm from "./JobRequestForm";
import JobRequestMobileCards from "./JobRequestMobileCards";
import JobRequestTable from "./JobRequestTable";
import JobRequestDetailModal from "./JobRequestDetailModal";

export default function JobRequests(props) {
  const { jobRequests } = props;
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const s = useJobRequests(props);

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [s.search, s.statusFilter]);

  const ITEMS_PER_PAGE = 10;
  const totalItems = s.filteredRequests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayFiltered = s.filteredRequests.slice(startIndex, endIndex);

  return (
    <div>
      <SectionTitle
        title="Job Requests"
        sub="Define vacancies, qualifications, and compensation details"
        action={<Btn label="+ New Job Request" onClick={s.openNew} />}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Input
          placeholder="Search requests by role, location, or ID..."
          value={s.search}
          onChange={(e) => s.setSearch(e.target.value)}
          style={{ maxWidth: 360, flex: 1 }}
        />
      </div>

      <JobRequestStatusFilter
        statuses={s.statuses}
        counts={s.counts}
        statusFilter={s.statusFilter}
        setStatusFilter={s.setStatusFilter}
      />

      <JobRequestSentBackBanner requests={jobRequests} onView={s.openView} />

      {s.showForm && (
        <JobRequestForm
          jobForms={s.jobForms}
          setJobForms={s.setJobForms}
          editingId={s.editingId}
          isMobile={isMobile}
          deptOptions={s.deptOptions}
          getRoleOptionsForDept={s.getRoleOptionsForDept}
          handleDepartmentChange={s.handleDepartmentChange}
          handleRoleChange={s.handleRoleChange}
          updateForm={s.updateForm}
          submitRequests={s.submitRequests}
          submitting={s.submitting}
          submitError={s.submitError}
          onCancel={s.cancelForm}
        />
      )}

      {isMobile ? (
        <>
          <JobRequestMobileCards
            filteredRequests={displayFiltered}
            totalItems={totalItems}
            startIndex={startIndex}
            onView={s.openView}
            scrollRef={s.scrollRef}
            currentCardIndex={s.currentCardIndex}
            setCurrentCardIndex={s.setCurrentCardIndex}
          />
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 10, marginBottom: 20 }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                style={{
                  background: T.white,
                  color: activePage === 1 ? T.inkFaint : T.primary,
                  border: `1.5px solid ${activePage === 1 ? T.border : T.primary}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: activePage === 1 ? "not-allowed" : "pointer",
                  opacity: activePage === 1 ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                &larr; Prev 10
              </button>
              <span style={{ fontSize: 12, color: T.inkMid, fontWeight: 600 }}>
                {activePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                style={{
                  background: activePage === totalPages ? T.white : T.primary,
                  color: activePage === totalPages ? T.inkFaint : T.white,
                  border: `1.5px solid ${activePage === totalPages ? T.border : T.primary}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: activePage === totalPages ? "not-allowed" : "pointer",
                  opacity: activePage === totalPages ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                Next 10 &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}`, background: T.white, borderTopLeftRadius: 12, borderTopRightRadius: 12, border: `1px solid ${T.border}`, borderBottom: "none", display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, whiteSpace: "nowrap" }}>
              Showing {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalItems)} of {totalItems}
            </span>
          </div>
          <JobRequestTable
            filteredRequests={displayFiltered}
            onRowClick={(index) => s.openView(displayFiltered[index])}
          />
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "16px 20px",
              border: `1px solid ${T.border}`,
              borderTop: "none",
              background: T.white,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
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
                &larr; Previous 10
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
                Next 10 &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {s.showViewModal && s.selectedRequest && (
        <JobRequestDetailModal
          selectedRequest={s.selectedRequest}
          setSelectedRequest={s.setSelectedRequest}
          isMobile={isMobile}
          deptOptions={s.deptOptions}
          getRoleOptionsForDept={s.getRoleOptionsForDept}
          handleDepartmentChangeInModal={s.handleDepartmentChangeInModal}
          handleRoleChangeInModal={s.handleRoleChangeInModal}
          hasChanges={s.hasChanges}
          handleAccept={s.handleAccept}
          cancelJobRequest={s.cancelJobRequest}
          onClose={s.closeModal}
        />
      )}
    </div>
  );
}
