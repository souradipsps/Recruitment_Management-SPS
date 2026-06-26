import React from "react";
import { CheckCircle } from "lucide-react";
import { MAROON } from "../../../data/dashboardMockData";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function AadhaarField({ aadharNumber, setAadharNumber, docsSubmitted }) {
  const digits = aadharNumber.replace(/\s/g, "");
  return (
    <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
        Aadhaar Number <span style={{ color: MAROON }}>*</span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={aadharNumber}
          disabled={docsSubmitted}
          onChange={(e) => {
            const rawVal = e.target.value.replace(/\D/g, "").slice(0, 12);
            const formatted = rawVal.replace(/(\d{4})(?=\d)/g, "$1 ");
            setAadharNumber(formatted);
          }}
          placeholder="1234 5678 9012"
          style={{
            width: "100%",
            maxWidth: "260px",
            padding: "8px 12px",
            border: `1.5px solid ${digits.length === 12 ? "#065f46" : "#e5e7eb"}`,
            borderRadius: "8px",
            fontSize: "0.85rem",
            outline: "none",
            background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
            color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
            cursor: docsSubmitted ? "not-allowed" : "text",
          }}
        />
        {digits.length === 12 ? (
          <span style={{ color: "#065f46", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle size={14} /> Valid format (12 digits)
          </span>
        ) : digits.length > 0 ? (
          <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 500 }}>
            Enter 12 digits ({12 - digits.length} remaining)
          </span>
        ) : (
          <span style={{ color: "#6b5c5c", fontSize: "0.72rem" }}>
            Format: 12-digit number
          </span>
        )}
      </div>
    </div>
  );
}

export function PanField({ panNumber, setPanNumber, docsSubmitted }) {
  return (
    <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "6px" }}>
        PAN Number <span style={{ color: MAROON }}>*</span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={panNumber}
          disabled={docsSubmitted}
          onChange={(e) => {
            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
            setPanNumber(val);
          }}
          placeholder="ABCDE1234F"
          style={{
            width: "100%",
            maxWidth: "260px",
            padding: "8px 12px",
            border: `1.5px solid ${PAN_REGEX.test(panNumber) ? "#065f46" : "#e5e7eb"}`,
            borderRadius: "8px",
            fontSize: "0.85rem",
            outline: "none",
            background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
            color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
            cursor: docsSubmitted ? "not-allowed" : "text",
          }}
        />
        {PAN_REGEX.test(panNumber) ? (
          <span style={{ color: "#065f46", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle size={14} /> Valid format (ABCDE1234F)
          </span>
        ) : panNumber.length > 0 ? (
          <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 500 }}>
            Must match alphanumeric format (e.g. ABCDE1234F)
          </span>
        ) : (
          <span style={{ color: "#6b5c5c", fontSize: "0.72rem" }}>
            Format: 10 characters (e.g. ABCDE1234F)
          </span>
        )}
      </div>
    </div>
  );
}

export function BankDetailsField({
  bankHolder,
  setBankHolder,
  bankAccount,
  setBankAccount,
  bankIfsc,
  setBankIfsc,
  bankName,
  setBankName,
  docsSubmitted,
}) {
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.85rem",
    outline: "none",
    background: docsSubmitted ? "#f3f4f6" : "#faf8f5",
    color: docsSubmitted ? "#6b5c5c" : "#1a0a0a",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "10px" }}>
        Bank Account Details <span style={{ color: MAROON }}>*</span>
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <div>
          <input
            type="text"
            value={bankHolder}
            disabled={docsSubmitted}
            onChange={(e) => setBankHolder(e.target.value)}
            placeholder="Account Holder's Name"
            style={inputStyle}
          />
        </div>
        <div>
          <input
            type="text"
            value={bankAccount}
            disabled={docsSubmitted}
            onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
            placeholder="Account Number"
            style={inputStyle}
          />
        </div>
        <div>
          <input
            type="text"
            value={bankIfsc}
            disabled={docsSubmitted}
            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
            placeholder="IFSC Code"
            style={inputStyle}
          />
        </div>
        <div>
          <input
            type="text"
            value={bankName}
            disabled={docsSubmitted}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Bank Name"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
