import { Dispatch, useCallback } from "react";
import { Action } from "../models/State";
import { Word } from "../models/Word";

export default function useRemoveWord(dispatch: Dispatch<Action>, word?: Word) {
  return useCallback(async () => {
    if (word === undefined) {
      return;
    }

    try {
      const res = await fetch(
        `${window.location.origin}/api/words/_id/${word._id}`,
        {
          method: "DELETE",
        }
      );

      if (res.status === 204) {
        dispatch({ type: "remove", payload: word.german });
        window.alert("Removed!");
      } else {
        window.alert(`Failed (status: ${res.status})`);
      }
    } catch (e) {
      window.alert(`Failed (${(e as any).message})`);
    }
  }, [dispatch, word]);
}
