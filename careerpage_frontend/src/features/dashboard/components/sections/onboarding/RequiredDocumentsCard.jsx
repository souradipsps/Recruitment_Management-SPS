import React from "react";
import { Upload, Clock } from "lucide-react";
import { MAROON } from "../../../data/dashboardMockData";
import { DocumentRow } from "./DocumentRow";
import { AadhaarField, PanField, BankDetailsField } from "./IdentityFields";

const COMPULSORY_DOCS = [
  { key: "aadhar", label: "Aadhaar Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Front & back scan — PDF or image" },
  { key: "pan", label: "PAN Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Required for salary processing" },
  { key: "bank_details", label: "Bank Details *", accept: ".pdf,.jpg,.jpeg,.png", note: "Passbook or cancelled cheque" },
  { key: "photo", label: "Passport Size Photo *", accept: ".jpg,.jpeg,.png", note: "White background, recent photo" },
];

const OPTIONAL_DOCS = [
  { key: "driving_license", label: "Driving License", accept: ".pdf,.jpg,.jpeg,.png", note: "Valid driving license (Optional)" },
  { key: "class10", label: "Class 10 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
  { key: "class12", label: "Class 12 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
  { key: "degree", label: "Degree / Graduation Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Final degree or provisional certificate (Optional)" },
  { key: "experience_cert", label: "Experience Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "From previous employer (Optional)" },
  { key: "prof_cert", label: "Professional Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Any relevant professional certificate (Optional)" },
];

export function RequiredDocumentsCard({
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
  docsSubmitted,
  startDocCamera,
  handleSubmitDocs,
  aadharNumber,
  setAadharNumber,
  panNumber,
  setPanNumber,
  pfNumber,
  setPfNumber,
  esiNumber,
  setEsiNumber,
  bankAccount,
  setBankAccount,
  bankIfsc,
  setBankIfsc,
  bankName,
  setBankName,
  bankHolder,
  setBankHolder,
}) {
  const rowProps = { docs, setDocs, docUrls, setDocUrls, docStatus, docsSubmitted, startDocCamera };

  const extraFor = (key) => {
    if (key === "aadhar") {
      return (
        <AadhaarField
          aadharNumber={aadharNumber}
          setAadharNumber={setAadharNumber}
          docsSubmitted={docsSubmitted}
        />
      );
    }
    if (key === "pan") {
      return (
        <PanField panNumber={panNumber} setPanNumber={setPanNumber} docsSubmitted={docsSubmitted} />
      );
    }
    if (key === "bank_details") {
      return (
        <BankDetailsField
          bankHolder={bankHolder}
          setBankHolder={setBankHolder}
          bankAccount={bankAccount}
          setBankAccount={setBankAccount}
          bankIfsc={bankIfsc}
          setBankIfsc={setBankIfsc}
          bankName={bankName}
          setBankName={setBankName}
          docsSubmitted={docsSubmitted}
        />
      );
    }
    return null;
  };

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
        <Upload size={16} color={MAROON} />
        <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>Required Documents</h2>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "8px" }}>
          Compulsory Details
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          {COMPULSORY_DOCS.map((doc) => (
            <DocumentRow key={doc.key} docKey={doc.key} label={doc.label} accept={doc.accept} note={doc.note} {...rowProps}>
              {extraFor(doc.key)}
            </DocumentRow>
          ))}
        </div>

        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: MAROON, marginBottom: "8px" }}>
          Optional Details
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
                PF Number
              </label>
              <input
                type="text"
                value={pfNumber}
                disabled={docsSubmitted}
                onChange={(e) => setPfNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter PF Number"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  outline: "none",
                  background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                  color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
                ESI Number
              </label>
              <input
                type="text"
                value={esiNumber}
                disabled={docsSubmitted}
                onChange={(e) => setEsiNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter ESI Number"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  outline: "none",
                  background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
                  color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
                }}
              />
            </div>
          </div>
          {OPTIONAL_DOCS.map((doc) => (
            <DocumentRow key={doc.key} docKey={doc.key} label={doc.label} accept={doc.accept} note={doc.note} {...rowProps} />
          ))}
        </div>

        {/* Document Submit Bottom Status / Action */}
        {docsSubmitted ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fef9f0",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              padding: "14px",
              marginTop: "8px",
            }}
          >
            <Clock size={20} color="#b45309" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#b45309" }}>
                Documents Under Review
              </div>
              <div style={{ color: "#374151", fontSize: "0.78rem", marginTop: "2px" }}>
                Your documents have been submitted and are currently under review by HR.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              onClick={handleSubmitDocs}
              style={{
                background: MAROON,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              className="hover:opacity-90"
            >
              Submit Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
