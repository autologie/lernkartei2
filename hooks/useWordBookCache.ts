import { Dispatch, useEffect } from "react";
import { Action, State } from "../models/State";

export function useWordBookCache(
  words: State["words"],
  dispatch: Dispatch<Action>
) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (words.complete) {
      window.localStorage.setItem("wordBook", JSON.stringify(words.words));

      return;
    }

    const saved = localStorage.getItem("wordBook");

    if (saved !== null) {
      try {
        dispatch({
          type: "restore-word-book",
          payload: JSON.parse(saved),
        });
      } catch (e) {}
    }
  }, [dispatch, words]);
}
