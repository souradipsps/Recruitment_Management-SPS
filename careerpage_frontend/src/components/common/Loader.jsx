import { motion } from "motion/react";
import loaderLogo from "../../assets/loader_logo.png";
import "./Loader.css";

// Full-screen loading overlay shown during page/view transitions. 
// Uses the premium loader_logo with a diagonal white/golden glint sweep.
export function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(92, 12, 33, 0.93)", /* Transparent maroon color */
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="loader-logo-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div 
          className="loader-logo-container"
          style={{
            height: 260, // Very big size
            width: "auto"
          }}
        >
          {/* Base logo image, completely unchanged in shape, colors, proportions, and transparency */}
          <img 
            src={loaderLogo} 
            className="loader-logo-base" 
            alt="South Point School Logo" 
          />
          {/* Overlay with diagonal sweep glint animation clipped to the logo's alpha channel */}
          <div 
            className="loader-logo-shimmer-overlay"
            style={{
              maskImage: `url(${loaderLogo})`,
              WebkitMaskImage: `url(${loaderLogo})`
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
