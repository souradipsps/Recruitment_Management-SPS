import React from "react";
import { CheckCircle } from "lucide-react";
import "../../css/sections/onboarding/IdentityFields.css";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function AadhaarField({ aadharNumber, setAadharNumber, disabled }) {
  const digits = aadharNumber.replace(/\s/g, "");
  return (
    <div className="idf-container">
      <label className="idf-label">
        Aadhaar Number <span className="idf-required-star">*</span>
      </label>
      <div className="idf-input-row">
        <input
          type="text"
          value={aadharNumber}
          disabled={disabled}
          onChange={(e) => {
            const rawVal = e.target.value.replace(/\D/g, "").slice(0, 12);
            const formatted = rawVal.replace(/(\d{4})(?=\d)/g, "$1 ");
            setAadharNumber(formatted);
          }}
          placeholder="1234 5678 9012"
          className={`idf-input idf-input--short ${digits.length === 12 ? "idf-input--valid" : ""}`}
        />
        {digits.length === 12 ? (
          <span className="idf-status-valid">
            <CheckCircle size={14} /> Valid format (12 digits)
          </span>
        ) : digits.length > 0 ? (
          <span className="idf-status-invalid">
            Enter 12 digits ({12 - digits.length} remaining)
          </span>
        ) : (
          <span className="idf-status-info">
            Format: 12-digit number
          </span>
        )}
      </div>
    </div>
  );
}

export function PanField({ panNumber, setPanNumber, disabled }) {
  return (
    <div className="idf-container">
      <label className="idf-label">
        PAN Number <span className="idf-required-star">*</span>
      </label>
      <div className="idf-input-row">
        <input
          type="text"
          value={panNumber}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
            setPanNumber(val);
          }}
          placeholder="ABCDE1234F"
          className={`idf-input idf-input--short ${PAN_REGEX.test(panNumber) ? "idf-input--valid" : ""}`}
        />
        {PAN_REGEX.test(panNumber) ? (
          <span className="idf-status-valid">
            <CheckCircle size={14} /> Valid format (ABCDE1234F)
          </span>
        ) : panNumber.length > 0 ? (
          <span className="idf-status-invalid">
            Must match alphanumeric format (e.g. ABCDE1234F)
          </span>
        ) : (
          <span className="idf-status-info">
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
  disabled,
}) {
  return (
    <div className="idf-container">
      <label className="idf-label idf-label--bank">
        Bank Account Details <span className="idf-required-star">*</span>
      </label>
      <div className="idf-grid">
        <div>
          <input
            type="text"
            value={bankHolder}
            disabled={disabled}
            onChange={(e) => setBankHolder(e.target.value)}
            placeholder="Account Holder's Name"
            className="idf-input"
          />
        </div>
        <div>
          <input
            type="text"
            value={bankAccount}
            disabled={disabled}
            onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
            placeholder="Account Number"
            className="idf-input"
          />
        </div>
        <div>
          <input
            type="text"
            value={bankIfsc}
            disabled={disabled}
            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
            placeholder="IFSC Code"
            className="idf-input"
          />
        </div>
        <div>
          <input
            type="text"
            value={bankName}
            disabled={disabled}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Bank Name"
            className="idf-input"
          />
        </div>
      </div>
    </div>
  );
}
