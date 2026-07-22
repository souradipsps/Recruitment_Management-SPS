import React from "react";
import { PartyPopper, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import "../../css/sections/onboarding/OfferLetterCard.css";

export function OfferLetterCard({
  offer,
  offerLoading,
  offerActionLoading,
  onAcceptOffer,
  onDeclineOffer,
  offerAccepted,
  offerRejected,
  showOfferConfirm,
  setShowOfferConfirm,
}) {
  const openLetter = () => {
    if (offer?.offerLetterUrl) window.open(offer.offerLetterUrl, "_blank", "noopener");
  };

  const downloadOfferLetterPDF = () => {
    if (!offer) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Offer Letter - ${offer.candidateName}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #72102a;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: 850;
              color: #72102a;
              margin: 0;
            }
            .subtitle {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-top: 5px;
            }
            .content {
              font-size: 15px;
              margin-top: 30px;
            }
            .footer {
              border-top: 1px solid #eee;
              padding-top: 20px;
              margin-top: 40px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">South Point School</h1>
            <div class="subtitle">Offer of Employment</div>
          </div>
          <div class="content">
            <p>Dear <strong>${offer.candidateName}</strong>,</p>
            <p>We are pleased to offer you the position of <strong>${offer.role}</strong> at South Point School. The monthly compensation for this role is <strong>${offer.salary}</strong>.</p>
            <p>This offer is valid until <strong>${offer.expiryDate}</strong>. Please confirm your acceptance by the deadline.</p>
          </div>
          <div class="footer">
            <p>Warm regards,<br/><strong>HR Department</strong><br/>South Point School</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="ol-card">
      <div className="ol-header">
        <PartyPopper size={16} />
        <h2 className="ol-title">Offer Letter</h2>
      </div>

      <div className="ol-body">
        {offerLoading ? (
          <div className="ol-details-box">
            <div className="ol-details-title">Loading your offer…</div>
          </div>
        ) : !offer ? (
          <div className="ol-details-box">
            <div className="ol-details-title">No offer letter yet</div>
            <div className="ol-details-val">
              You don't have an offer letter at the moment. If HR extends one, it will appear here.
            </div>
          </div>
        ) : (
          <>
            {/* Status Banners */}
            {offerAccepted && (
              <div className="ol-banner--accepted">
                <CheckCircle size={20} color="#065f46" className="ol-banner-icon" />
                <div>
                  <div className="ol-banner-title--accepted">
                    Offer Accepted!
                  </div>
                  <div className="ol-banner-text">
                    Welcome to South Point School. Joining date: <strong>{offer.joiningDate || "TBD"}</strong>
                  </div>
                </div>
              </div>
            )}

            {offerRejected && (
              <div className="ol-banner--declined">
                <XCircle size={20} color="#991b1b" className="ol-banner-icon" />
                <div>
                  <div className="ol-banner-title--declined">
                    Offer Declined
                  </div>
                  <div className="ol-banner-text">
                    You have declined the offer. Contact HR if this was a mistake.
                  </div>
                </div>
              </div>
            )}

            {/* Offer Details Grid */}
            <div className="ol-details-box">
              <div className="ol-details-title">
                Offer Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                {[
                  { label: "Position", value: offer.role },
                  { label: "Department", value: offer.department },
                  { label: "Joining Date", value: offer.joiningDate },
                  { label: "Offered CTC", value: offer.salary },
                  { label: "Issued On", value: offer.issuedDate },
                  { label: "Offer Expires", value: offer.expiryDate },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="ol-details-label">
                      {label}
                    </div>
                    <div
                      className={`ol-details-val ${
                        label === "Offer Expires" ? "ol-details-val--expires" : ""
                      }`}
                    >
                      {value || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ol-actions">
              {offer.offerLetterUrl && (
                <button className="ol-btn-secondary" onClick={openLetter}>
                  <Eye size={14} /> View Letter
                </button>
              )}

              {!offerRejected && (
                <button className="ol-btn-secondary" onClick={downloadOfferLetterPDF}>
                  <Download size={14} /> Download PDF
                </button>
              )}

              {!offerAccepted && !offerRejected && (
                <>
                  <button
                    onClick={() => setShowOfferConfirm("accept")}
                    className="ol-btn-accept"
                    disabled={offerActionLoading}
                  >
                    <CheckCircle size={14} /> Accept Offer
                  </button>
                  <button
                    onClick={() => setShowOfferConfirm("reject")}
                    className="ol-btn-decline"
                    disabled={offerActionLoading}
                  >
                    <XCircle size={14} /> Decline Offer
                  </button>
                </>
              )}
            </div>

            {/* Accept / Decline Confirm Boxes */}
            {showOfferConfirm === "accept" && (
              <div className="ol-confirm--accept">
                <div className="ol-confirm-title--accept">
                  Confirm acceptance of the offer for <strong>{offer.role}</strong>?
                </div>
                <div className="ol-confirm-actions">
                  <button
                    onClick={onAcceptOffer}
                    className="ol-confirm-btn--accept"
                    disabled={offerActionLoading}
                  >
                    {offerActionLoading ? "Accepting…" : "Yes, Accept"}
                  </button>
                  <button
                    onClick={() => setShowOfferConfirm(null)}
                    className="ol-confirm-btn--cancel"
                    disabled={offerActionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showOfferConfirm === "reject" && (
              <div className="ol-confirm--reject">
                <div className="ol-confirm-title--reject">
                  Are you sure you want to decline the offer for <strong>{offer.role}</strong>? This cannot be undone.
                </div>
                <div className="ol-confirm-actions">
                  <button
                    onClick={onDeclineOffer}
                    className="ol-confirm-btn--reject"
                    disabled={offerActionLoading}
                  >
                    {offerActionLoading ? "Declining…" : "Yes, Decline"}
                  </button>
                  <button
                    onClick={() => setShowOfferConfirm(null)}
                    className="ol-confirm-btn--cancel"
                    disabled={offerActionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
