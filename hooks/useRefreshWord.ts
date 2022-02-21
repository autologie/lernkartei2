import { Dispatch, useCallback } from "react";
import { Action } from "../models/State";
import { Word } from "../models/Word";

export default function useRefreshWord(
  dispatch: Dispatch<Action>,
  word?: Word
) {
  return useCallback(async () => {
    if (word === undefined) {
      return;
    }

    try {
      const res = await fetch(
        `${window.location.origin}/api/words/${word.german}/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: word._id }),
        }
      );

      if (res.status === 200) {
        dispatch({ type: "replace", payload: await res.json() });
        window.alert("Updated!");
      } else {
        window.alert(`Failed (status: ${res.status})`);
      }
    } catch (e) {
      window.alert(`Failed (${(e as any).message})`);
    }
  }, [dispatch, word]);
}
