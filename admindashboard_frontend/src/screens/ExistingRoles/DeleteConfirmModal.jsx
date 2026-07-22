import { useState } from "react";
import { T } from "../../theme";
import { Modal, ModalHeader, Btn } from "../../components/ui";
import { deleteRole } from "../../api/rolesApi";

export default function DeleteConfirmModal({ deleteConfirmId, onClose, roles, setRoles }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleClose = () => {
    setDeleteError("");
    onClose();
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const target = roles.find((r) => r.id === deleteConfirmId);

    if (target && target.backendId != null) {
      setDeleting(true);
      setDeleteError("");
      try {
        await deleteRole(target.backendId);
      } catch (err) {
        console.error("Failed to delete role:", err);
        setDeleteError(err.message || "Failed to delete role. Please try again.");
        setDeleting(false);
        return;
      }
      setDeleting(false);
    }

    setRoles((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    handleClose();
  };

  return (
    <Modal open={!!deleteConfirmId} onClose={handleClose} maxWidth={400}>
      <ModalHeader title="Confirm Deletion" onClose={handleClose} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "10px 0" }}>
        <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5 }}>
          Are you sure you want to delete this existing role? This action cannot be undone.
        </div>
        {deleteError && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", fontSize: 13, fontWeight: 600, border: "1px solid #FCA5A5" }}>
            {deleteError}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <Btn label="Cancel" onClick={handleClose} disabled={deleting} />
          <Btn
            label={deleting ? "Deleting…" : "Delete"}
            variant="danger"
            onClick={confirmDelete}
            disabled={deleting}
          />
        </div>
      </div>
    </Modal>
  );
}
