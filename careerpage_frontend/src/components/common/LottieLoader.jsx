import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOADER_URL } from "../../lib/constants";

// Full-screen loading screen shown on initial page refresh.
// Uses the original Lottie animation from the brand assets.
export function LottieLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <DotLottieReact
        src={LOADER_URL}
        loop
        autoplay
        style={{ width: 220, height: 220 }}
      />
    </div>
  );
}
