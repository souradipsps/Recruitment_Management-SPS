import logoImg from "../../../assets/logo.png";

const FOOTER_LINKS = ["Privacy Policy", "Terms of Use", "Accessibility", "Contact Us"];

export function Footer() {
  return (
    <footer style={{ background: "#ffffff", borderTop: `1px solid rgba(107,26,26,0.12)` }} className="py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="South Point School" className="h-9 w-auto object-contain" />
          <span style={{ color: "#6b5c5c", fontSize: "0.8rem" }}>South Point School · Guwahati, Assam</span>
        </div>
        <div style={{ fontSize: "0.78rem" }} className="flex flex-wrap gap-6 justify-center">
          {FOOTER_LINKS.map((l) => (
            <a key={l} href="#" style={{ color: "#6b5c5c" }} className="hover:text-maroon transition-colors">{l}</a>
          ))}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#6b5c5c" }}>© 2026 South Point School. All rights reserved.</div>
      </div>
    </footer>
  );
}
