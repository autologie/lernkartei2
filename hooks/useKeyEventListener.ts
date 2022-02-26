import { Dispatch, useEffect } from "react";
import { Action, State } from "../models/State";

export default function useKeyEventListener(
  state: State,
  dispatch: Dispatch<Action>
) {
  const choiceCount = state.history[0]?.question.choices.length;

  useEffect(() => {
    if (choiceCount === undefined) {
      return;
    }

    const choices = Array.from({ length: choiceCount }).map((_, i) =>
      String(i + 1)
    );

    function handleEvent(e: KeyboardEvent) {
      if (e.altKey || e.shiftKey || e.metaKey || e.ctrlKey) {
        return;
      }

      if (e.key === "ArrowLeft") {
        dispatch({ type: "back" });
        return;
      }

      if (e.key === "Escape") {
        dispatch({ type: "close-modal" });
        return;
      }

      if (e.key === "ArrowRight" || e.key === "Enter") {
        dispatch({ type: "next" });
        return;
      }

      if (e.key === "/" && state.modal === undefined) {
        e.stopPropagation();
        e.preventDefault();
        dispatch({ type: "search", payload: "" });
        return;
      }

      if (choices.includes(e.key)) {
        dispatch({ type: "respond", payload: Number.parseInt(e.key, 10) - 1 });
      }
    }

    window.addEventListener("keydown", handleEvent);

    return () => {
      window.removeEventListener("keydown", handleEvent);
    };
  }, [choiceCount, dispatch, state.modal]);
}
