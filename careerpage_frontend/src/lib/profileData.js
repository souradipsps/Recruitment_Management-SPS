// Pure helpers that assemble the candidate profile object from the several
// overlapping sources App tracks: the signup payload, a saved profile, an
// in-progress application draft, and the bare logged-in name.

const fullNameFromSignup = (signupData, loggedInUser) =>
  signupData ? `${signupData.name} ${signupData.lastName || ""}`.trim() : loggedInUser;

// Full merged profile shown in the dashboard. Draft values win over saved ones.
// Returns null when there is nothing to show yet.
export function buildMergedProfileData({ savedProfileData, applicationDraft, signupData, loggedInUser }) {
  if (!savedProfileData && !applicationDraft) return null;
  return {
    fullName: savedProfileData?.fullName || fullNameFromSignup(signupData, loggedInUser),
    email: savedProfileData?.email || signupData?.email || "",
    phone: savedProfileData?.phone || signupData?.phone || "",
    location: savedProfileData?.location || "Guwahati, Assam",
    resumeFile: savedProfileData?.resumeFile || "",
    resumeUrl: savedProfileData?.resumeUrl || "",
    education: applicationDraft?.education ?? savedProfileData?.education ?? "",
    degreeName: applicationDraft?.degreeName ?? savedProfileData?.degreeName ?? "",
    professionalQualification: applicationDraft?.professionalQual ?? savedProfileData?.professionalQualification ?? "",
    professionalQualificationOther: applicationDraft?.professionalQualOther ?? savedProfileData?.professionalQualificationOther ?? "",
    experience: applicationDraft?.experience ?? savedProfileData?.experience ?? "",
    salary: applicationDraft?.salary ?? savedProfileData?.salary ?? "",
    extracurricular: applicationDraft?.extracurricular ?? savedProfileData?.extracurricular ?? "",
    extracurricularOther: applicationDraft?.extracurricularOther ?? savedProfileData?.extracurricularOther ?? "",
    selectedRoles: applicationDraft?.selectedRoles ?? savedProfileData?.selectedRoles ?? [],
    selectedSkills: applicationDraft?.selectedSkills ?? savedProfileData?.selectedSkills ?? [],
    linkedin: applicationDraft?.linkedin ?? savedProfileData?.linkedin ?? "",
    portfolio: applicationDraft?.portfolio ?? savedProfileData?.portfolio ?? "",
  };
}

// Minimal identity fields the JobApplicationModal pre-fills its form with.
export function buildApplicationFormProfile({ savedProfileData, signupData, loggedInUser }) {
  return {
    firstName: savedProfileData?.fullName?.split(" ")[0] || signupData?.name || loggedInUser,
    lastName: savedProfileData?.fullName?.split(" ").slice(1).join(" ") || signupData?.lastName || "",
    email: savedProfileData?.email || "",
    phone: savedProfileData?.phone || "",
    location: savedProfileData?.location || "Guwahati, Assam",
  };
}

// Fold a submitted application's professional section into the saved profile,
// seeding a base profile from signup info when none exists yet.
export function applyProfessionalData(prev, professionalData, { signupData, loggedInUser }) {
  return {
    ...(prev || {
      fullName: fullNameFromSignup(signupData, loggedInUser),
      email: signupData?.email || "",
      phone: signupData?.phone || "",
      location: "Guwahati, Assam",
      resumeFile: "",
      resumeUrl: "",
    }),
    education: professionalData.education,
    degreeName: professionalData.degreeName,
    professionalQualification: professionalData.professionalQualification,
    professionalQualificationOther: professionalData.professionalQualificationOther,
    experience: professionalData.experience,
    salary: professionalData.salary,
    extracurricular: professionalData.extracurricular,
    extracurricularOther: professionalData.extracurricularOther,
    selectedRoles: professionalData.selectedRoles,
    selectedSkills: professionalData.selectedSkills,
    linkedin: professionalData.linkedin,
    portfolio: professionalData.portfolio,
  };
}
