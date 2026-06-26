import React from "react";
import { MAROON } from "../../../data/dashboardMockData";
import { SkillsMultiSelect } from "./SkillsMultiSelect";

export function ProfessionalInfoCard({ profile, setProfile, sectionRef }) {
  return (
    <div
      ref={sectionRef}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      <h2
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: MAROON,
          marginBottom: "16px",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Professional Information
      </h2>
      <div style={{ gap: "14px" }} className="grid grid-cols-1 sm:grid-cols-2">
        {/* Educational Qualification */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Educational Qualification <span style={{ color: MAROON }}>*</span>
          </label>
          <select
            value={profile.highestEducation}
            onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select education</option>
            <option>High School / 12th</option>
            <option>Diploma</option>
            <option>Bachelor's Degree</option>
            <option>Master's Degree</option>
            <option>M.Phil</option>
            <option>PhD / Doctorate</option>
            <option>B.Ed / M.Ed</option>
          </select>
        </div>

        {/* Degree Name */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Degree Name
          </label>
          <input
            value={profile.degreeName}
            onChange={(e) => setProfile({ ...profile, degreeName: e.target.value })}
            placeholder="e.g. M.Sc Mathematics"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Professional Qualification */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Professional Qualification <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
          </label>
          <select
            value={profile.professionalQualification}
            onChange={(e) => setProfile({ ...profile, professionalQualification: e.target.value })}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select qualification</option>
            <option>B.Ed (Bachelor of Education)</option>
            <option>M.Ed (Master of Education)</option>
            <option>CTET / STET Certified</option>
            <option>NET / SET Qualified</option>
            <option>NTT (Nursery Teacher Training)</option>
            <option>D.El.Ed (Diploma in Elementary Education)</option>
            <option>PG Diploma in Education</option>
            <option>Other</option>
          </select>
        </div>

        {/* Other Professional Qualification Text */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Detail (if 'Other')
          </label>
          <input
            value={profile.professionalQualificationOther}
            onChange={(e) => setProfile({ ...profile, professionalQualificationOther: e.target.value })}
            placeholder="e.g. B.Ed, CTET, NET"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Years of Experience
          </label>
          <select
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select experience</option>
            <option>0–1 years (Fresher)</option>
            <option>1–3 years</option>
            <option>3–5 years</option>
            <option>5–8 years</option>
            <option>8+ years</option>
          </select>
        </div>

        {/* Extracurricular Qualification */}
        <div className="sm:col-start-1">
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Extracurricular Qualification <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
          </label>
          <select
            value={profile.extracurricular}
            onChange={(e) => setProfile({ ...profile, extracurricular: e.target.value })}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select qualification</option>
            <option>Sports Coaching</option>
            <option>Music / Performing Arts</option>
            <option>Drama / Theatre</option>
            <option>Visual Arts / Craft</option>
            <option>Debate / Public Speaking</option>
            <option>Yoga / Physical Education</option>
            <option>Scouting / NCC</option>
            <option>Community Service / Social Work</option>
            <option>STEM / Robotics Club</option>
            <option>Environmental Activities</option>
            <option>Other</option>
          </select>
        </div>

        {/* Other Extracurricular Detail */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Detail (if 'Other')
          </label>
          <input
            value={profile.extracurricularOther}
            onChange={(e) => setProfile({ ...profile, extracurricularOther: e.target.value })}
            placeholder="e.g. Sports Coach, Music Diploma"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Roles Interested In */}
      <div style={{ marginTop: "14px" }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
          Roles Interested In
        </label>
        <SkillsMultiSelect
          selected={profile.roles}
          onChange={(v) => setProfile({ ...profile, roles: v })}
          placeholder="Select or add roles interested in…"
        />
      </div>

      {/* Skills & Strengths */}
      <div style={{ marginTop: "14px" }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
          Skills & Strengths
        </label>
        <SkillsMultiSelect
          selected={profile.skills}
          onChange={(v) => setProfile({ ...profile, skills: v })}
          placeholder="Select or add skills…"
        />
      </div>

      {/* Salary Expectations + LinkedIn + Portfolio */}
      <div style={{ marginTop: "14px", gap: "14px" }} className="grid grid-cols-1 sm:grid-cols-2">
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Salary Expectations (₹ per annum)
          </label>
          <select
            value={profile.salary}
            onChange={(e) => setProfile({ ...profile, salary: e.target.value })}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select expected salary</option>
            <option value="200000">₹2,00,000</option>
            <option value="300000">₹3,00,000</option>
            <option value="400000">₹4,00,000</option>
            <option value="500000">₹5,00,000</option>
            <option value="600000">₹6,00,000</option>
            <option value="700000">₹7,00,000</option>
            <option value="800000">₹8,00,000</option>
            <option value="1000000">₹10,00,000</option>
            <option value="1200000">₹12,00,000+</option>
          </select>
        </div>
        <div className="hidden sm:block" />
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            LinkedIn Profile <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
          </label>
          <input
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/yourname"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4a4a4a", display: "block", marginBottom: "5px" }}>
            Portfolio / GitHub / Other <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span>
          </label>
          <input
            value={profile.portfolio}
            onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
            placeholder="https://github.com/username"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              background: "#faf8f5",
              color: "#1a0a0a",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>
  );
}
