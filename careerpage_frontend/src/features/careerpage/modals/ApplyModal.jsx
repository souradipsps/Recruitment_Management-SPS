import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Upload, Linkedin, Check, Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

const MAROON = "#72102a";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "0.875rem",
  outline: "none",
  background: "#f9fafb",
  color: "#1a0a0a",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#4a4a4a",
  display: "block",
  marginBottom: "5px",
};

const sectionStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
};

const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: "0.95rem",
  color: MAROON,
  marginBottom: "16px",
  fontFamily: "'Playfair Display', serif",
};

const ALL_ROLES = [
  "Senior Mathematics Teacher", "English Language & Literature Teacher", "Physics Teacher",
  "School Counsellor", "Computer Science Teacher", "Physical Education Teacher",
  "Academic Coordinator", "Office Administrator", "Facilities & Maintenance Supervisor", "IT Support Technician",
];

const ALL_SKILLS = [
  "Curriculum Development", "Classroom Management", "Student Assessment", "Communication", "Leadership",
  "Team Collaboration", "Microsoft Office", "Data Analysis", "Project Management", "Problem Solving",
  "CBSE Curriculum", "Digital Literacy", "Research & Development", "Counselling", "Event Management",
  "Administration", "IT Support", "Sports Coaching", "Content Creation", "Public Speaking",
];

function SkillsMultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed]);
    setCustom("");
  };

  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{ minHeight: "42px", padding: "8px 32px 8px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb", cursor: "pointer", display: "flex", flexWrap: "wrap", gap: "4px", position: "relative" }}>
        {selected.length === 0 && <span style={{ color: "#9ca3af", fontSize: "0.875rem", alignSelf: "center" }}>{placeholder}</span>}
        {selected.map((s) => (
          <span key={s} onClick={(e) => { e.stopPropagation(); toggle(s); }} style={{ background: `rgba(114,16,42,0.1)`, color: MAROON, fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            {s} ×
          </span>
        ))}
        <span style={{ position: "absolute", right: "10px", top: "50%", transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: "transform 0.2s", color: "#6b5c5c", fontSize: "0.75rem" }}>▼</span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "8px", zIndex: 100, maxHeight: "220px", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: "6px" }}>
            <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="Add custom…" style={{ flex: 1, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "0.8rem", outline: "none" }} />
            <button onClick={addCustom} style={{ background: MAROON, color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>Add</button>
          </div>
          {options.map((opt) => (
            <div key={opt} onClick={() => toggle(opt)} style={{ padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: selected.includes(opt) ? MAROON : "#1a0a0a", background: selected.includes(opt) ? "rgba(114,16,42,0.05)" : "transparent", fontWeight: selected.includes(opt) ? 600 : 400 }}>
              {opt}
              {selected.includes(opt) && <Check size={13} color={MAROON} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ApplyModal({ onClose, signupData, onSubmitData }) {
  const fileRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [firstName, setFirstName] = useState(signupData?.name || "");
  const [lastName, setLastName] = useState(signupData?.lastName || "");
  const [form, setForm] = useState({
    email: signupData?.email || "",
    phone: signupData?.phone || "",
    location: "",
    education: "",
    degreeName: "",
    professionalQualification: "",
    professionalQualificationOther: "",
    experience: "",
    salary: "",
    extracurricular: "",
    extracurricularOther: "",
    linkedin: "",
    portfolio: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim()) { toast.error("First name is required"); return; }
    if (!lastName.trim()) { toast.error("Last name is required"); return; }
    if (!form.phone.trim() || form.phone.length !== 10) { toast.error("Phone number must be exactly 10 digits"); return; }
    if (!form.location.trim()) { toast.error("Current Location is required"); return; }
    if (!form.education) { toast.error("Educational Qualification is required"); return; }
    if (!form.degreeName.trim()) { toast.error("Degree Name is required"); return; }
    if (!form.experience) { toast.error("Years of Experience is required"); return; }
    if (!form.salary) { toast.error("Salary Expectations is required"); return; }
    if (selectedRoles.length === 0) { toast.error("Please select at least one Role Interested In"); return; }
    if (selectedSkills.length === 0) { toast.error("Please select at least one Skill / Strength"); return; }
    if (!fileName) { toast.error("Please upload your CV / Resume"); return; }

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const data = {
      fullName, email: form.email, phone: form.phone, location: form.location,
      education: form.education, degreeName: form.degreeName,
      professionalQualification: form.professionalQualification,
      professionalQualificationOther: form.professionalQualificationOther,
      experience: form.experience, salary: form.salary,
      extracurricular: form.extracurricular, extracurricularOther: form.extracurricularOther,
      selectedRoles, selectedSkills, linkedin: form.linkedin, portfolio: form.portfolio, resumeFile: fileName,
    };
    onSubmitData?.(data);
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "relative", background: "#f3f4f6", borderRadius: "16px", width: "100%", maxWidth: "580px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", marginBottom: "24px" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <X size={15} color="#fff" />
          </button>
          <div style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #3a0a1a 100%)`, padding: "28px 24px 22px" }}>
            <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}>My Profile</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.6 }}>Submit a general application to South Point School Guwahati. We'll keep your information on file for suitable positions.</p>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✓</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "1.3rem", fontWeight: 700 }}>Application Submitted!</h3>
              <p style={{ color: "#6b5c5c", fontSize: "0.875rem", marginTop: "8px" }}>Thank you for applying to South Point School. We'll be in touch soon.</p>
              <button onClick={onClose} style={{ marginTop: "20px", background: MAROON, color: "#fff", border: "none", borderRadius: "8px", padding: "12px 32px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>Close</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><User size={13} style={{ color: MAROON }} />First Name <span style={{ color: MAROON }}>*</span></span></label>
                    <input style={inputStyle} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><User size={13} style={{ color: MAROON }} />Last Name <span style={{ color: MAROON }}>*</span></span></label>
                    <input required style={inputStyle} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Mail size={13} style={{ color: MAROON }} />Email Address <span style={{ color: MAROON }}>*</span></span></label>
                    <input style={{ ...inputStyle, background: "#f3f4f6", color: "#6b5c5c" }} type="email" value={form.email} readOnly />
                  </div>
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Phone size={13} style={{ color: MAROON }} />Phone Number <span style={{ color: MAROON }}>*</span></span></label>
                    <input required style={inputStyle} placeholder="10-digit number" value={form.phone} maxLength={10} minLength={10} inputMode="numeric"
                      onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                  </div>
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><MapPin size={13} style={{ color: MAROON }} />Current Location <span style={{ color: MAROON }}>*</span></span></label>
                    <input required style={inputStyle} placeholder="Guwahati, Assam" value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Professional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><GraduationCap size={13} style={{ color: MAROON }} />Educational Qualification <span style={{ color: MAROON }}>*</span></span></label>
                    <select required style={inputStyle} value={form.education} onChange={(e) => set("education", e.target.value)}>
                      <option value="">Select education</option>
                      <option>High School / 12th</option><option>Diploma</option><option>Bachelor's Degree</option>
                      <option>Master's Degree</option><option>M.Phil</option><option>PhD / Doctorate</option><option>B.Ed / M.Ed</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Degree Name <span style={{ color: MAROON }}>*</span></label>
                    <input required style={inputStyle} placeholder="e.g. M.Sc Mathematics" value={form.degreeName} onChange={(e) => set("degreeName", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Professional Qualification <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span></label>
                    <select style={inputStyle} value={form.professionalQualification} onChange={(e) => set("professionalQualification", e.target.value)}>
                      <option value="">Select qualification</option>
                      <option>B.Ed (Bachelor of Education)</option><option>M.Ed (Master of Education)</option>
                      <option>CTET / STET Certified</option><option>NET / SET Qualified</option>
                      <option>NTT (Nursery Teacher Training)</option><option>D.El.Ed (Diploma in Elementary Education)</option>
                      <option>PG Diploma in Education</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Degree Name</label>
                    <input style={inputStyle} placeholder="e.g. B.Ed, CTET, NET" value={form.professionalQualificationOther} onChange={(e) => set("professionalQualificationOther", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Briefcase size={13} style={{ color: MAROON }} />Years of Experience <span style={{ color: MAROON }}>*</span></span></label>
                    <select required style={inputStyle} value={form.experience} onChange={(e) => set("experience", e.target.value)}>
                      <option value="">Select experience</option>
                      <option>0–1 years (Fresher)</option><option>1–3 years</option><option>3–5 years</option><option>5–8 years</option><option>8+ years</option>
                    </select>
                  </div>
                  <div className="sm:col-start-1">
                    <label style={labelStyle}>Extracurricular Qualification <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span></label>
                    <select style={inputStyle} value={form.extracurricular} onChange={(e) => set("extracurricular", e.target.value)}>
                      <option value="">Select qualification</option>
                      <option>Sports Coaching</option><option>Music / Performing Arts</option><option>Drama / Theatre</option>
                      <option>Visual Arts / Craft</option><option>Debate / Public Speaking</option><option>Yoga / Physical Education</option>
                      <option>Scouting / NCC</option><option>Community Service / Social Work</option><option>STEM / Robotics Club</option>
                      <option>Environmental Activities</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Degree Name</label>
                    <input style={inputStyle} placeholder="e.g. Sports Coach, Music Diploma" value={form.extracurricularOther} onChange={(e) => set("extracurricularOther", e.target.value)} />
                  </div>
                </div>
                <div style={{ marginTop: "14px" }}>
                  <label style={labelStyle}>Roles Interested In <span style={{ color: MAROON }}>*</span></label>
                  <SkillsMultiSelect options={ALL_ROLES} selected={selectedRoles} onChange={setSelectedRoles} placeholder="Select one or more roles…" />
                </div>
                <div style={{ marginTop: "14px" }}>
                  <label style={labelStyle}>Skills & Strengths <span style={{ color: MAROON }}>*</span></label>
                  <SkillsMultiSelect options={ALL_SKILLS} selected={selectedSkills} onChange={setSelectedSkills} placeholder="Select your skills…" />
                </div>
                <div style={{ marginTop: "14px" }} className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Briefcase size={13} style={{ color: MAROON }} />Salary Expectations (₹ per annum) <span style={{ color: MAROON }}>*</span></span></label>
                    <select required style={inputStyle} value={form.salary} onChange={(e) => set("salary", e.target.value)}>
                      <option value="">Select expected salary</option>
                      <option value="200000">₹2,00,000</option><option value="300000">₹3,00,000</option><option value="400000">₹4,00,000</option>
                      <option value="500000">₹5,00,000</option><option value="600000">₹6,00,000</option><option value="700000">₹7,00,000</option>
                      <option value="800000">₹8,00,000</option><option value="1000000">₹10,00,000</option><option value="1200000">₹12,00,000+</option>
                    </select>
                  </div>
                  <div className="hidden sm:block"></div>
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Linkedin size={13} style={{ color: MAROON }} />LinkedIn Profile <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span></span></label>
                    <input style={inputStyle} placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: "5px" }}><LinkIcon size={13} style={{ color: MAROON }} />Portfolio / GitHub / Other <span style={{ fontWeight: 400, color: "#9a8a8a" }}>(Optional)</span></span></label>
                    <input style={inputStyle} placeholder="https://github.com/username" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>CV / Resume <span style={{ color: MAROON }}>*</span></h3>
                <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${MAROON}`, borderRadius: "10px", padding: "28px", textAlign: "center", cursor: "pointer", background: "#fdf8f9" }}>
                  <Upload size={28} style={{ color: MAROON, margin: "0 auto 10px" }} />
                  <div style={{ color: "#1a0a0a", fontWeight: 600, fontSize: "0.875rem" }}>{fileName || "Upload Resume"}</div>
                  <div style={{ color: "#6b5c5c", fontSize: "0.75rem", marginTop: "4px" }}>PDF, DOC or DOCX • Maximum 5 MB</div>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 5 * 1024 * 1024) { toast.error("File exceeds 5 MB limit."); return; }
                      setFileName(f.name);
                    }
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "4px" }}>
                <button type="button" onClick={onClose} style={{ background: "#fff", border: "1.5px solid #e5e7eb", color: "#4a4a4a", fontWeight: 600, fontSize: "0.875rem", padding: "12px 28px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ background: MAROON, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "12px 28px", borderRadius: "8px", border: "none", cursor: "pointer", transition: "opacity 0.2s" }} className="hover:opacity-90">Submit Application</button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
