import { HistoryItem } from "./HistoryItem";
import { addResult, LearningProgress } from "./LearningProgress";
import { Question } from "./Question";
import { createQuestion, createWeights, Weights } from "./Weights";
import { modify, Word } from "./Word";

export interface State {
  words?: Word[];
  question?: Question;
  done: boolean;
  missResponses: number[];
  history: HistoryItem[];
  progress: LearningProgress;
  weights: Weights;
  historyCursor?: number;
  size?: number;
  allDone: boolean;
}

export type Action =
  | { type: "respond"; payload: number }
  | { type: "back" }
  | { type: "next" }
  | { type: "add"; payload: Word }
  | { type: "loaded"; payload: Word[] };

export function applyAction(state: State, action: Action): State {
  switch (action.type) {
    case "respond":
      if (state.question === undefined) {
        return state;
      }

      if (state.question.answerIndex === action.payload) {
        const progress = addResult(
          state.progress,
          state.question,
          state.missResponses.length === 0
        );

        return {
          ...state,
          done: true,
          progress,
          weights: createWeights(state.words ?? [], progress),
        };
      }

      return {
        ...state,
        missResponses: state.missResponses.concat([action.payload]),
      };
    case "back":
      return state.historyCursor === undefined
        ? state.history.length > 0
          ? { ...state, historyCursor: 0 }
          : state
        : state.historyCursor < state.history.length - 1
        ? { ...state, historyCursor: state.historyCursor + 1 }
        : state;
    case "next":
      if (state.historyCursor === undefined) {
        if (state.words === undefined || !state.done || state.allDone) {
          return state;
        }

        const history = (
          state.question === undefined
            ? []
            : [
                {
                  question: state.question,
                  missResponses: state.missResponses,
                },
              ]
        ).concat(state.history);
        const nextQuestion = createQuestion(state.weights, state.words);

        if (nextQuestion === undefined) {
          return {
            ...state,
            history,
            allDone: true,
          };
        }

        return {
          ...state,
          question: nextQuestion,
          done: false,
          missResponses: [],
          history: history,
        };
      }

      return {
        ...state,
        historyCursor:
          state.historyCursor === 0 ? undefined : state.historyCursor - 1,
      };
    case "add":
      return state.words === undefined
        ? state
        : { ...state, words: state.words.concat([modify(action.payload)]) };
    case "loaded":
      const words = action.payload.slice(0, state.size).map(modify);
      const weights = createWeights(words, state.progress);

      return {
        ...state,
        words: words,
        weights,
        question: createQuestion(weights, words),
      };
  }
}

export function getInitialState(size?: number): State {
  return {
    done: false,
    missResponses: [],
    history: [],
    size,
    allDone: false,
    progress: { table: {}, tick: 0 },
    weights: {},
  };
}
