import { useRef } from "react";

export function useSwipe(callback: (direction: "n" | "e" | "s" | "w") => void) {
  const xDown = useRef<number | undefined>(undefined);
  const yDown = useRef<number | undefined>(undefined);

  if (typeof window === "undefined") {
    return;
  }

  function handleTouchStart(evt: TouchEvent) {
    const firstTouch = evt.touches[0];

    xDown.current = firstTouch.clientX;
    yDown.current = firstTouch.clientY;
  }

  function handleTouchMove(evt: TouchEvent) {
    if (xDown.current === undefined || yDown.current === undefined) {
      return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;
    const xDiff = xDown.current - xUp;
    const yDiff = yDown.current - yUp;
    const direction =
      Math.abs(xDiff) > Math.abs(yDiff)
        ? xDiff > 0
          ? "e"
          : "w"
        : yDiff > 0
        ? "s"
        : "n";

    callback(direction);

    xDown.current = undefined;
    yDown.current = undefined;
  }

  window.document.addEventListener("touchstart", handleTouchStart, false);
  window.document.addEventListener("touchmove", handleTouchMove, false);

  return () => {
    window.document.removeEventListener("touchstart", handleTouchStart, false);
    window.document.removeEventListener("touchmove", handleTouchMove, false);
  };
}
