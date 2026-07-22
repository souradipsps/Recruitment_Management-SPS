# Bug: Resubmitted requests show a duplicate "Submitted" entry in Approve Request activity history

## Summary
When a Sent-Back Role Request or Job Request is edited and resubmitted, the **Approve Request** screen's activity history shows two identical **"Submitted"** entries instead of the expected sequence:

```
Submitted → Sent Back → Resubmitted
```

The Role Requests and Job Requests screens display the correct 3-step sequence, but that is only because the frontend fakes a "Resubmitted" label locally for those two screens — it is not what the backend actually stores. The Approve Request screen reads the real backend data and therefore shows the bug.

## Root cause
File: `rms_backend/jobs/signals.py`

Two signal handlers create an `ApprovalRequest` + `ApprovalHistory` row whenever a Role/Job Request is resubmitted (moved back to `"Pending"` after being Sent Back). In both handlers, the resubmit branch logs the history entry with `action="Submitted"` — the same label used for the very first submission — instead of `action="Resubmitted"`.

### `create_approval_for_role_request` (~line 93)
```python
elif instance.status == "Pending":
    # If it's updated to Pending (resubmitted), check if there is already an active Pending approval
    has_pending = ApprovalRequest.objects.filter(role_request=instance, status="Pending").exists()
    if not has_pending:
        apr = ApprovalRequest.objects.create(
            request_id=instance.request_id,
            type="Role Request",
            title=instance.role,
            department=instance.department,
            submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
            status="Pending",
            role_request=instance,
        )
        ApprovalHistory.objects.create(
            approval=apr,
            action="Submitted",   # <-- BUG: should be "Resubmitted"
            acted_by=apr.submitted_by or "Requester",
            note=instance.justification or ""
        )
```

### `create_approval_for_job_request` (~line 178)
```python
elif instance.status == "Pending":
    has_pending = ApprovalRequest.objects.filter(job_request=instance, status="Pending").exists()
    if not has_pending:
        apr = ApprovalRequest.objects.create(
            request_id=instance.request_id,
            type="Job Request",
            title=instance.role,
            department=instance.department or "",
            submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
            status="Pending",
            job_request=instance,
        )
        ApprovalHistory.objects.create(
            approval=apr,
            action="Submitted",   # <-- BUG: should be "Resubmitted"
            acted_by=apr.submitted_by or "Requester",
            note=instance.justification or instance.description or ""
        )
```

Both of these are inside the `elif instance.status == "Pending":` branch of the `else:` clause (i.e. this only runs on an *update* to Pending, not on initial creation — the `if created:` branch above correctly logs `"Submitted"` for the first submission).

## Why it only shows up in Approve Request
- `ApprovalRequestSerializer.get_history()` (in `jobs/serializers.py`) returns the raw `ApprovalHistory` rows straight from the database for a given `job_request`/`role_request`, in creation order. Since both cycles are logged as `"Submitted"`, the true stored sequence is `Submitted → Sent Back → Submitted`.
- The Role Requests (`RoleRequests.jsx`) and Job Requests (`useJobRequests.js`) screens don't hit this bug visually because, on resubmit, they push a **client-only** `{ act: "Resubmitted", ... }` entry into local state for immediate UI feedback. That entry is never sent to or stored by the backend — it's a local optimistic patch, not real data.
- The Approve Request screen (`ApprovalModal.jsx`) has no such local patch; it displays exactly what `GET /api/approvals/` returns, so the duplicate `"Submitted"` label is visible there.

## Suggested fix
In both signal handlers in `jobs/signals.py`, change the resubmit branch's `ApprovalHistory.objects.create(...)` call from:
```python
action="Submitted",
```
to:
```python
action="Resubmitted",
```

This only affects the `elif instance.status == "Pending":` branch inside the `else:` (update) clause — the initial-submission `action="Submitted"` in the `if created:` branch must stay unchanged.

## Files involved
- `rms_backend/jobs/signals.py` — `create_approval_for_role_request` (~line 93), `create_approval_for_job_request` (~line 178)
- `rms_backend/jobs/serializers.py` — `ApprovalRequestSerializer.get_history()` (for context; no change needed here)
- Frontend references (context only, no backend change needed there):
  - `admindashboard_frontend/src/screens/RoleRequests.jsx`
  - `admindashboard_frontend/src/screens/JobRequests/useJobRequests.js`
  - `admindashboard_frontend/src/screens/ApprovalRequests/ApprovalModal.jsx`
