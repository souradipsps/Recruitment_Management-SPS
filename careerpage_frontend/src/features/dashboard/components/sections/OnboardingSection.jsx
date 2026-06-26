import React from "react";
import { motion } from "motion/react";
import { OfferLetterCard } from "./onboarding/OfferLetterCard";
import { RequiredDocumentsCard } from "./onboarding/RequiredDocumentsCard";
import { OnboardingProgress } from "./onboarding/OnboardingProgress";

export function OnboardingSection({
  offerAccepted,
  setOfferAccepted,
  offerRejected,
  setOfferRejected,
  showOfferConfirm,
  setShowOfferConfirm,
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
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
  docsSubmitted,
  startDocCamera,
  handleSubmitDocs,
}) {
  const uploadedKeys = Object.keys(docs);
  const anyUploadedAndVerified = uploadedKeys.some((k) => docStatus[k] === "verified");

  const steps = [
    { label: "Profile Submitted", done: true, desc: "Your basic profile has been received." },
    { label: "Offer Letter Accepted", done: offerAccepted, desc: "Accept your offer letter to proceed." },
    { label: "Documentation Upload", done: docsSubmitted, desc: "Upload all required documents after accepting the offer." },
    { label: "Document Verification", done: anyUploadedAndVerified, desc: "HR will verify your submitted documents." },
    { label: "Background Check", done: false, desc: "HR will initiate a background verification." },
    { label: "Joining Confirmation", done: false, desc: "You will receive a final confirmation email." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#1a0a0a",
          fontSize: "1.4rem",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Onboarding
      </h1>
      <p style={{ color: "#6b5c5c", fontSize: "0.85rem", marginBottom: "20px" }}>
        Submit required documents and complete your onboarding process.
      </p>

      <OfferLetterCard
        offerAccepted={offerAccepted}
        setOfferAccepted={setOfferAccepted}
        offerRejected={offerRejected}
        setOfferRejected={setOfferRejected}
        showOfferConfirm={showOfferConfirm}
        setShowOfferConfirm={setShowOfferConfirm}
      />

      {/* Required Documents Checklist - visible after acceptance */}
      {offerAccepted && (
        <RequiredDocumentsCard
          docs={docs}
          setDocs={setDocs}
          docUrls={docUrls}
          setDocUrls={setDocUrls}
          docStatus={docStatus}
          docsSubmitted={docsSubmitted}
          startDocCamera={startDocCamera}
          handleSubmitDocs={handleSubmitDocs}
          aadharNumber={aadharNumber}
          setAadharNumber={setAadharNumber}
          panNumber={panNumber}
          setPanNumber={setPanNumber}
          pfNumber={pfNumber}
          setPfNumber={setPfNumber}
          esiNumber={esiNumber}
          setEsiNumber={setEsiNumber}
          bankAccount={bankAccount}
          setBankAccount={setBankAccount}
          bankIfsc={bankIfsc}
          setBankIfsc={setBankIfsc}
          bankName={bankName}
          setBankName={setBankName}
          bankHolder={bankHolder}
          setBankHolder={setBankHolder}
        />
      )}

      <OnboardingProgress steps={steps} />
    </motion.div>
  );
}
