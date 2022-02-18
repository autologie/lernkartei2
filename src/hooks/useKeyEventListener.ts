import { Dispatch, useEffect } from "react";
import { Question } from "../models/Question";
import { Action } from "../models/State";

export default function useKeyEventListener(
  question: Question | undefined,
  dispatch: Dispatch<Action>,
  onAddNew: () => void
) {
  const choiceCount = question?.choices.length;

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

      if (e.key === " " || e.key === "ArrowRight") {
        dispatch({ type: "next" });
        return;
      }

      if (e.key === "n") {
        onAddNew();
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
  }, [choiceCount, dispatch]);
}
