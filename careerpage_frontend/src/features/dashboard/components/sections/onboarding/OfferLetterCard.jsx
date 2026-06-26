import React from "react";
import { PartyPopper, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { MAROON, offerLetter } from "../../../data/dashboardMockData";

export function OfferLetterCard({
  offerAccepted,
  setOfferAccepted,
  offerRejected,
  setOfferRejected,
  showOfferConfirm,
  setShowOfferConfirm,
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <PartyPopper size={16} color={MAROON} />
        <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>Offer Letter</h2>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Status Banners */}
        {offerAccepted && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#f0fdf4",
              border: "1px solid #6ee7b7",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "16px",
            }}
          >
            <CheckCircle size={20} color="#065f46" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#065f46" }}>
                Offer Accepted!
              </div>
              <div style={{ color: "#374151", fontSize: "0.78rem", marginTop: "2px" }}>
                Welcome to South Point School. Joining date: <strong>{offerLetter.joiningDate}</strong>
              </div>
            </div>
          </div>
        )}

        {offerRejected && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff5f5",
              border: "1px solid #fca5a5",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "16px",
            }}
          >
            <XCircle size={20} color="#991b1b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#991b1b" }}>
                Offer Declined
              </div>
              <div style={{ color: "#374151", fontSize: "0.78rem", marginTop: "2px" }}>
                You have declined the offer. Contact HR if this was a mistake.
              </div>
            </div>
          </div>
        )}

        {/* Offer Details Grid */}
        <div
          style={{
            background: "#fef9f0",
            border: "1px solid #fde68a",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#1a0a0a", marginBottom: "10px" }}>
            Offer Details
          </div>
          <div style={{ gap: "10px" }} className="grid grid-cols-1 sm:grid-cols-2">
            {[
              { label: "Position", value: offerLetter.role },
              { label: "Department", value: offerLetter.department },
              { label: "Joining Date", value: offerLetter.joiningDate },
              { label: "Offered CTC", value: offerLetter.salary },
              { label: "Issued On", value: offerLetter.issuedDate },
              { label: "Offer Expires", value: offerLetter.expiryDate },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  style={{
                    color: "#6b5c5c",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: label === "Offer Expires" ? "#b45309" : "#1a0a0a",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginTop: "2px",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            style={{
              border: `1px solid ${MAROON}`,
              color: MAROON,
              background: "#fff",
              borderRadius: "8px",
              padding: "9px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
            onClick={() => window.open("#", "_blank")}
          >
            <Eye size={14} /> View Letter
          </button>

          {!offerRejected && (
            <button
              style={{
                border: `1px solid ${MAROON}`,
                color: MAROON,
                background: "#fff",
                borderRadius: "8px",
                padding: "9px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
              onClick={() => window.open("#", "_blank")}
            >
              <Download size={14} /> Download PDF
            </button>
          )}

          {!offerAccepted && !offerRejected && (
            <>
              <button
                onClick={() => setShowOfferConfirm("accept")}
                style={{
                  background: "#065f46",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              >
                <CheckCircle size={14} /> Accept Offer
              </button>
              <button
                onClick={() => setShowOfferConfirm("reject")}
                style={{
                  background: "#fff",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  borderRadius: "8px",
                  padding: "9px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                <XCircle size={14} /> Decline Offer
              </button>
            </>
          )}
        </div>

        {/* Accept / Decline Confirm Boxes */}
        {showOfferConfirm === "accept" && (
          <div style={{ marginTop: "14px", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#065f46", marginBottom: "10px" }}>
              Confirm acceptance of the offer for <strong>{offerLetter.role}</strong>?
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setOfferAccepted(true);
                  setShowOfferConfirm(null);
                }}
                style={{
                  background: "#065f46",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                }}
              >
                Yes, Accept
              </button>
              <button
                onClick={() => setShowOfferConfirm(null)}
                style={{
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  color: "#4a4a4a",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showOfferConfirm === "reject" && (
          <div style={{ marginTop: "14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#991b1b", marginBottom: "10px" }}>
              Are you sure you want to decline the offer for <strong>{offerLetter.role}</strong>? This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setOfferRejected(true);
                  setShowOfferConfirm(null);
                }}
                style={{
                  background: "#991b1b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                }}
              >
                Yes, Decline
              </button>
              <button
                onClick={() => setShowOfferConfirm(null)}
                style={{
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  color: "#4a4a4a",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
