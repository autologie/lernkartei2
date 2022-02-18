import { useEffect } from "react";
import { State } from "../models/State";

export default function useNotifier(state: State) {
  useEffect(() => {
    if (state.allDone) {
      window.alert("All done!");
    }
  }, [state]);
}
