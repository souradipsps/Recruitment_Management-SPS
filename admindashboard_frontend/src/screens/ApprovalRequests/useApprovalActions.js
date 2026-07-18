import { useState } from "react";
import { takeApprovalAction } from "../../api/approvalsApi";
import { updateJobRequestFields } from "../../api/jobRequestsApi";
import { updateRoleRequest } from "../../api/roleRequestsApi";
import { fetchJobPostings } from "../../api/jobPostingsApi";
import { fetchRoles } from "../../api/rolesApi";

const parseSal = (v) => parseFloat((v || "").replace(/,/g, "")) || 0;

/**
 * Encapsulates performAction and takeAction logic.
 * Called from the ApprovalRequests index; returns the two action handlers.
 */
export function useApprovalActions({
  sel,
  setSel,
  comment,
  setFieldErrors,
  closeModal,
  setRequests,
  setRoleRequests,
  setJobRequests,
  setExistingRoles,
  setJobPostings,
  onNavigateToApplications,
  onNavigateToExistingRoles,
}) {
  const [isActionPending, setIsActionPending] = useState(false);

  // Persist action to backend (if backendId present) and sync all local state.
  const performAction = async (r, action, customComment) => {
    if (isActionPending) return false;
    setIsActionPending(true);

    // takeApprovalAction only sends the action verb + note — any field edits
    // made in this modal (department, role, salary, etc.) must be saved to the
    // underlying Job/Role Request separately, or they'd silently vanish.
    if (r.type === "Job Request" && r.sourceDbId != null) {
      try {
        await updateJobRequestFields(r.sourceDbId, {
          role: r.role,
          department: r.dept,
          location: r.location,
          category: r.category,
          salary: r.salary,
          vacancies: r.vacancies,
          exp: r.experience,
          qual: r.qual,
          type: r.empType,
          description: r.description,
          justification: r.just,
          skills: r.skills,
        });
      } catch (err) {
        console.error("Failed to save job request edits:", err);
        alert(`Could not save changes: ${err.message}`);
        setIsActionPending(false);
        return false;
      }
    }

    let updatedRole = null;
    if (r.type === "Role Request" && r.sourceDbId != null) {
      try {
        const formattedVariations = (r.variations || []).map((v) => {
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

        updatedRole = await updateRoleRequest(r.sourceDbId, {
          department: r.dept,
          role: r.role,
          justification: r.just,
          variations: formattedVariations,
        });
      } catch (err) {
        console.error("Failed to save role request edits:", err);
        alert(`Could not save changes: ${err.message}`);
        setIsActionPending(false);
        return false;
      }
    }

    if (r.backendId != null) {
      try {
        await takeApprovalAction(r.backendId, action, customComment || "");
      } catch (err) {
        console.error("Failed to submit approval action:", err);
        alert(`Could not submit action: ${err.message}`);
        setIsActionPending(false);
        return false;
      }
    }

    const now = new Date().toLocaleDateString();
    const entry = { act: action, by: "HR Admin", date: now, note: customComment || "" };
    const updated = { ...r, status: action, comment: customComment || "", history: [...(r.history || []), entry] };

    // Match on backendId (unique per ApprovalRequest row), not id — a request's
    // id is the request_id, shared by every sibling row created across resubmit
    // cycles, so matching on it would flip all siblings to this action's status.
    setRequests((prev) => prev.map((item) => (item.backendId === r.backendId ? updated : item)));

    if (r.type === "Role Request") {
      setRoleRequests((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(r.sourceId)) return item;
          const updated2 = {
            ...item,
            dept: r.dept,
            role: r.role,
            type: r.empType || item.type,
            status: action,
            comment: customComment || "",
            history: updated.history,
            salaryRange: r.salary ? r.salary.replace(/^₹/, "") : item.salaryRange,
            experience: r.experience || item.experience,
            category: r.category || item.category,
            variations: updatedRole ? updatedRole.variations : r.variations,
          };
          delete updated2.minSalary;
          delete updated2.maxSalary;
          delete updated2.minExperience;
          delete updated2.maxExperience;
          return updated2;
        }),
      );
    }

    if (r.type === "Job Request") {
      setJobRequests((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(r.sourceId)) return item;
          return {
            ...item,
            status: action,
            comment: customComment || "",
            history: updated.history,
            department: r.dept !== undefined ? r.dept : item.department,
            role: r.role !== undefined ? r.role : item.role,
            location: r.location !== undefined ? r.location : item.location,
            category: r.category !== undefined ? r.category : item.category,
            salary: r.salary !== undefined ? r.salary : item.salary,
            vacancies: r.vacancies !== undefined ? r.vacancies : item.vacancies,
            exp: r.experience !== undefined ? r.experience : item.exp,
            qual: r.qual !== undefined ? r.qual : item.qual,
            type: r.empType !== undefined ? r.empType : item.type,
            justification: r.just !== undefined ? r.just : item.justification,
            description: r.description !== undefined ? r.description : item.description,
            skills: r.skills !== undefined ? r.skills : item.skills,
          };
        }),
      );
    }

    if (action === "Approved" && r.type === "Role Request") {
      try {
        const roles = await fetchRoles();
        setExistingRoles(roles);
      } catch (err) {
        console.error("Failed to refresh existing roles after approval:", err);
      }
      if (onNavigateToExistingRoles) setTimeout(() => { onNavigateToExistingRoles(); }, 300);
    }

    if (action === "Approved" && r.type === "Job Request") {
      // The backend auto-creates the real JobPosting (with its own backendId)
      // as part of approving the Job Request — refetch instead of fabricating
      // a local placeholder, so Publish/Unpublish always has a backendId to
      // act on rather than being silently local-only until the next reload.
      try {
        const postings = await fetchJobPostings();
        setJobPostings(postings);
      } catch (err) {
        console.error("Failed to refresh job postings after approval:", err);
      }
      if (onNavigateToApplications) setTimeout(() => { onNavigateToApplications(); }, 300);
    }

    if (sel && sel.id === r.id) setSel(updated);
    setIsActionPending(false);
    return true;
  };

  // Validates modal form fields then delegates to performAction.
  const takeAction = async (action) => {
    if (!sel || isActionPending) return;
    let updatedSel = { ...sel };

    if (sel.type === "Role Request") {
      const minS = sel.minSalary ?? sel.salary?.replace(/^₹/, "").split("-")[0]?.trim() ?? "";
      const maxS = sel.maxSalary ?? sel.salary?.replace(/^₹/, "").split("-")[1]?.trim() ?? "";
      const minE = sel.minExp ?? (sel.experience ? String(sel.experience).split("-")[0]?.trim() : "");
      const maxE = sel.maxExp ?? (sel.experience ? String(sel.experience).split("-")[1]?.trim() : "");

      const errs = {};
      if (minS && maxS && parseSal(minS) >= parseSal(maxS)) errs.minSalary = "Min salary must be less than max salary";
      if (minE && maxE && parseFloat(minE) >= parseFloat(maxE)) errs.minExp = "Min experience must be less than max experience";
      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

      updatedSel.salary = minS && maxS ? `₹${minS}-${maxS}` : sel.salary;
      updatedSel.experience = minE && maxE ? `${minE}-${maxE}` : sel.experience;
    }

    if (sel.type === "Job Request") {
      updatedSel.vacancies = sel.vacancies;
      updatedSel.qual = sel.qual;
      updatedSel.empType = sel.empType;
      updatedSel.description = sel.description;
    }

    setFieldErrors({});
    const ok = await performAction(updatedSel, action, comment);
    if (ok && action !== "Sent Back") closeModal();
  };

  return { performAction, takeAction, isActionPending };
}
