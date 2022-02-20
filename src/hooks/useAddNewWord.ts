import { Dispatch, useCallback } from "react";
import { Action } from "../models/State";

export default function useAddNewWord(dispatch: Dispatch<Action>) {
  return useCallback(async () => {
    const word = window.prompt("Word");

    if (word !== null) {
      try {
        const res = await fetch(`${window.location.origin}/api/words/${word}`, {
          method: "POST",
        });

        if (res.status === 200) {
          dispatch({ type: "add", payload: await res.json() });
        } else {
          window.alert(`Failed (status: ${res.status})`);
        }
      } catch (e) {
        window.alert(`Failed (${(e as any).message})`);
      }
    }
  }, [dispatch]);
}
