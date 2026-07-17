import React from "react";
import { motion } from "motion/react";
import { OfferLetterCard } from "./onboarding/OfferLetterCard";
import { RequiredDocumentsCard } from "./onboarding/RequiredDocumentsCard";
import { OnboardingProgress } from "./onboarding/OnboardingProgress";
import "../css/sections/OnboardingSection.css";

export function OnboardingSection({
  offer,
  offerLoading,
  offerActionLoading,
  onAcceptOffer,
  onDeclineOffer,
  offerAccepted,
  offerRejected,
  showOfferConfirm,
  setShowOfferConfirm,
  onboardingRecord,
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  setDocFiles,
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
  docsSubmitting,
  startDocCamera,
  handleSubmitDocs,
}) {
  // Per-document Verified/Rejected badges, straight from the same backend
  // fields the admin dashboard reads and writes (verified_docs/rejected_docs).
  const docStatus = onboardingRecord?.docStatus || {};

  // Steps 4-6 mirror exactly what HR has done in the admin dashboard's
  // Onboarding Checklist (task_docs_verify / task_bgc / task_checkin) — this
  // is what keeps the two dashboards in sync.
  const steps = [
    { label: "Profile Submitted", done: true, desc: "Your basic profile has been received." },
    { label: "Offer Letter Accepted", done: offerAccepted, desc: "Accept your offer letter to proceed." },
    { label: "Documentation Upload", done: docsSubmitted, desc: "Upload all required documents after accepting the offer." },
    { label: "Document Verification", done: !!onboardingRecord?.docsVerified, desc: "HR will verify your submitted documents." },
    { label: "Background Check", done: !!onboardingRecord?.backgroundCheckDone, desc: "HR will initiate a background verification." },
    { label: "Joining Confirmation", done: !!onboardingRecord?.checkedIn, desc: "You will receive a final confirmation email." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="ob-page-title">
        Onboarding
      </h1>
      <p className="ob-page-sub">
        Submit required documents and complete your onboarding process.
      </p>

      <OfferLetterCard
        offer={offer}
        offerLoading={offerLoading}
        offerActionLoading={offerActionLoading}
        onAcceptOffer={onAcceptOffer}
        onDeclineOffer={onDeclineOffer}
        offerAccepted={offerAccepted}
        offerRejected={offerRejected}
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
          setDocFiles={setDocFiles}
          docStatus={docStatus}
          docsSubmitted={docsSubmitted}
          docsSubmitting={docsSubmitting}
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
