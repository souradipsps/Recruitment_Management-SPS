import React from "react";
import { motion } from "motion/react";
import { MAROON } from "../../data/dashboardMockData";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";
import { ProfessionalInfoCard } from "./profile/ProfessionalInfoCard";
import { ResumeUploadCard } from "./profile/ResumeUploadCard";

export function ProfileSection({
  profile,
  setProfile,
  resumeFile,
  resumeUrl,
  fileSizeError,
  handleResumeUpload,
  handleViewResume,
  handleSave,
  saved,
  personalSectionRef,
  professionalSectionRef,
  resumeSectionRef,
}) {
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
        My Profile & Resume
      </h1>
      <p
        style={{
          color: "#6b5c5c",
          fontSize: "0.85rem",
          marginBottom: "20px",
        }}
      >
        Keep your profile updated to improve your chances.
      </p>

      <PersonalInfoCard
        profile={profile}
        setProfile={setProfile}
        sectionRef={personalSectionRef}
      />

      <ProfessionalInfoCard
        profile={profile}
        setProfile={setProfile}
        sectionRef={professionalSectionRef}
      />

      <ResumeUploadCard
        resumeFile={resumeFile}
        resumeUrl={resumeUrl}
        fileSizeError={fileSizeError}
        handleResumeUpload={handleResumeUpload}
        handleViewResume={handleViewResume}
        sectionRef={resumeSectionRef}
      />

      {/* Save Changes Button */}
      <button
        onClick={handleSave}
        style={{
          background: MAROON,
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.85rem",
          border: "none",
          borderRadius: "8px",
          padding: "10px 28px",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
      >
        {saved ? "Saved ✓" : "Save Changes"}
      </button>
    </motion.div>
  );
}
