import { useBreakpoint } from "../../hooks";
import { SectionTitle, Btn, Input } from "../../components/ui";
import { useJobRequests } from "./useJobRequests";
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
        <JobRequestMobileCards
          filteredRequests={s.filteredRequests}
          onView={s.openView}
          scrollRef={s.scrollRef}
          currentCardIndex={s.currentCardIndex}
          setCurrentCardIndex={s.setCurrentCardIndex}
        />
      ) : (
        <JobRequestTable
          filteredRequests={s.filteredRequests}
          onRowClick={(index) => s.openView(s.filteredRequests[index])}
        />
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
