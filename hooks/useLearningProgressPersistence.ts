import { Dispatch, useEffect } from "react";
import { LearningProgress } from "../models/LearningProgress";
import { Action } from "../models/State";

const STORAGE_KEY = "learning_progress";

export function useLearningProgressPersistence(
  learningProgress: LearningProgress,
  dispatch: Dispatch<Action>
) {
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      dispatch({ type: "load-learning-progress" });
      return;
    }

    try {
      dispatch({ type: "load-learning-progress", payload: JSON.parse(saved) });

      console.log("Learning progress loaded");
    } catch (e) {
      dispatch({ type: "load-learning-progress" });
    }
  }, [dispatch]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(learningProgress));
    console.log("Learning progress saved");
  }, [learningProgress]);
}
