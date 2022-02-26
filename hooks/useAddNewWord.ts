import { Dispatch, useCallback, useEffect } from "react";
import { Action } from "../models/State";

export default function useAddNewWord(
  dispatch: Dispatch<Action>,
  word?: string
) {
  useEffect(() => {
    if (word === undefined) {
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/words/${word}`, {
          method: "POST",
        });

        if (res.status === 200) {
          dispatch({ type: "added", payload: await res.json() });
          window.alert("Added!");
        } else {
          dispatch({ type: "add-failed" });
          window.alert(`Failed (status: ${res.status})`);
        }
      } catch (e) {
        dispatch({ type: "add-failed" });
        window.alert(`Failed (${(e as any).message})`);
      }
    })();
  }, [dispatch, word]);
}
