import { useEffect, useMemo } from "react";
import { LearningLogData } from "../models/LearningLog";
import { State } from "../models/State";

export default function useLogSync(state: State) {
  const log = useMemo<LearningLogData | undefined>(() => {
    const h = state.history[0];

    return h === undefined || !state.done
      ? undefined
      : {
          sessionId: state.sessionId,
          word: h.question.word,
          definitionIndex: h.question.definitionIndex,
          questionType: h.question.type,
          miss: h.missResponses.length > 0,
        };
  }, [state.done, state.history, state.sessionId]);

  useEffect(() => {
    if (log === undefined) {
      return;
    }

    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
  }, [log]);
}
