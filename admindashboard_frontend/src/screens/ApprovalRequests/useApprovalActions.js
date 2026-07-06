import { takeApprovalAction } from "../../api/approvalsApi";
import { updateJobRequestFields } from "../../api/jobRequestsApi";

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
  // Persist action to backend (if backendId present) and sync all local state.
  const performAction = async (r, action, customComment) => {
    // takeApprovalAction only sends the action verb + note — any field edits
    // made in this modal (department, role, salary, etc.) must be saved to the
    // underlying Job Request separately, or they'd silently vanish.
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
        return false;
      }
    }

    if (r.backendId != null) {
      try {
        await takeApprovalAction(r.backendId, action, customComment || "");
      } catch (err) {
        console.error("Failed to submit approval action:", err);
        alert(`Could not submit action: ${err.message}`);
        return false;
      }
    }

    const now = new Date().toLocaleDateString();
    const entry = { act: action, by: "HR Admin", date: now, note: customComment || "" };
    const updated = { ...r, status: action, comment: customComment || "", history: [...(r.history || []), entry] };

    setRequests((prev) => prev.map((item) => (item.id === r.id ? updated : item)));

    if (r.type === "Role Request") {
      setRoleRequests((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(r.sourceId)) return item;
          const updated2 = {
            ...item,
            dept: r.dept,
            role: r.role,
            status: action,
            comment: customComment || "",
            history: updated.history,
            salaryRange: r.salary ? r.salary.replace(/^₹/, "") : item.salaryRange,
            experience: r.experience || item.experience,
            category: r.category || item.category,
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
      setExistingRoles((prev) => {
        const exists = prev.some((x) => x.role === r.role && x.dept === r.dept);
        if (exists) return prev;
        const cleanedSalary = r.salary ? r.salary.replace(/^₹/, "") : "";
        return [...prev, {
          id: `ROL-${Date.now()}`, dept: r.dept, role: r.role, type: "Full-time",
          headcount: 1, filled: 0, currentFilled: 0, status: "Inactive", currentStatus: "Inactive",
          experience: r.experience || "—",
          salaryRange: cleanedSalary || "—",
          category: r.category || "—",
        }];
      });
      if (onNavigateToExistingRoles) setTimeout(() => { onNavigateToExistingRoles(); }, 300);
    }

    if (action === "Approved" && r.type === "Job Request") {
      setJobPostings((prev) => {
        const exists = prev.some((p) => p.role === r.role);
        if (exists) return prev;
        return [...prev, {
          id: `POST-${Date.now()}`, role: r.role, channel: "Career Page",
          status: "Unpublished", posted: now, expiry: "30 Days", apps: 0,
          location: r.location || "",
          salary: r.salary || "",
          vacancies: r.vacancies || "",
          exp: r.experience || "",
          qual: r.qual || "",
          type: r.empType || "",
          description: r.description || "",
        }];
      });
      if (onNavigateToApplications) setTimeout(() => { onNavigateToApplications(); }, 300);
    }

    if (sel && sel.id === r.id) setSel(updated);
    return true;
  };

  // Validates modal form fields then delegates to performAction.
  const takeAction = async (action) => {
    if (!sel) return;
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

  return { performAction, takeAction };
}
