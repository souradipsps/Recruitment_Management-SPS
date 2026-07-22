import { T } from "../../theme";

export const getStatusStyle = (status) => {
  switch (status) {
    case "Approved": return { border: `1.5px solid ${T.green}`, background: T.greenLight, color: T.green };
    case "Rejected": return { border: "1.5px solid #DC2626", background: "#FEE2E2", color: "#DC2626" };
    case "Cancelled": return { border: "1.5px solid #6B7280", background: "#F3F4F6", color: "#6B7280" };
    case "Sent Back": return { border: `1.5px solid ${T.amber}`, background: T.amberLight, color: T.amber };
    default: return { border: `1.5px solid ${T.blue}`, background: T.blueLight, color: T.blue };
  }
};

export const emptyForm = () => ({
  id: Date.now() + Math.random(),
  department: "",
  role: "",
  existing_role: null,
  vacancies: "",
  exp: "",
  qual: [],
  type: "",
  salary: "",
  location: "",
  category: "",
  description: "",
  justification: "",
  skills: [],
  status: "Pending",
  comment: "",
});
