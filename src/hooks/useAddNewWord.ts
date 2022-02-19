import { Dispatch, useCallback } from "react";
import { Action } from "../models/State";

export default function useAddNewWord(dispatch: Dispatch<Action>) {
  return useCallback(async () => {
    const word = window.prompt("Word");

    if (word !== null) {
      try {
        const res = await fetch(`http://localhost:8080/words/${word}`);

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
