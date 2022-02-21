import { Dispatch, useEffect } from "react";
import { Action, State } from "../models/State";

export default function useNextAutomatically(
  afterMillis: number,
  state: State,
  dispatch: Dispatch<Action>
) {
  const shouldTrigger =
    state.historyCursor === 0 &&
    state.history.length > 0 &&
    state.history[0].missResponses.length === 0 &&
    state.done;

  useEffect(() => {
    if (!shouldTrigger) {
      return;
    }

    const timeout = window.setTimeout(
      () => dispatch({ type: "next" }),
      afterMillis
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [afterMillis, dispatch, shouldTrigger]);
}
