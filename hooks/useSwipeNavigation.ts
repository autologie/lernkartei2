import { Dispatch, useCallback } from "react";
import { Action } from "../models/State";
import { useSwipe } from "./useSwipe";

export function useSwipeNavigation(dispatch: Dispatch<Action>) {
  const handleSwipe = useCallback((direction: "n" | "s" | "w" | "e") => {
    if (direction === "n" || direction === "s") {
      return;
    }

    dispatch({ type: direction === "e" ? "next" : "back" });
  }, []);

  useSwipe(handleSwipe);
}
