import { useLayoutEffect, useRef, useState } from "react";

// Cross-fades between top-level views. When `view` changes we hold the previous
// `deferredView` briefly so the outgoing view can animate out before the next
// one mounts. Returns the view that should actually be rendered plus a flag for
// styling the in-flight transition.
export function useViewTransition(view) {
  const [deferredView, setDeferredView] = useState(view);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevView = useRef(view);

  useLayoutEffect(() => {
    if (prevView.current === view) return;
    prevView.current = view;
    setIsTransitioning(true);

    const viewTimeout = setTimeout(() => setDeferredView(view), 250);
    const transitionTimeout = setTimeout(() => setIsTransitioning(false), 450);

    return () => {
      clearTimeout(viewTimeout);
      clearTimeout(transitionTimeout);
    };
  }, [view]);

  return { deferredView, isTransitioning };
}
