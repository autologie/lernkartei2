import { Dispatch, useEffect } from "react";
import { Action } from "../models/State";

export default function useRemoteWords(dispatch: Dispatch<Action>) {
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:8080/words");

      if (res.status !== 200) {
        window.alert("Could not load data");
        return;
      }

      const data = await res.json();

      dispatch({ type: "loaded", payload: data });
    })();
  }, [dispatch]);
}
