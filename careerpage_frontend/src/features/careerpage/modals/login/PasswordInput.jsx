import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

// Password field with a show/hide toggle. Used by the login, signup and
// forgot-password forms. Each instance manages its own visibility state.
export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  required = false,
  invalid = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="lm-input-wrap">
      <Lock size={15} className="lm-input-icon" />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="lm-input lm-input--pad-right"
        required={required}
        style={{ borderColor: invalid ? "#d00" : undefined }}
      />
      <button type="button" onClick={() => setShow(!show)} className="lm-eye-btn">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
