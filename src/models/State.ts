import { HistoryItem } from "./HistoryItem";
import { createQuestion, Question } from "./Question";
import { Word } from "./Word";

export interface State {
  words?: Word[];
  question?: Question;
  done: boolean;
  missResponses: number[];
  history: HistoryItem[];
  historyCursor?: number;
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
      return state.question === undefined
        ? state
        : state.question.answerIndex === action.payload
        ? { ...state, done: true }
        : {
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
      return state.historyCursor === undefined
        ? state.words === undefined || !state.done
          ? state
          : {
              ...state,
              question: createQuestion(state.words),
              done: false,
              missResponses: [],
              history: (state.question === undefined
                ? []
                : [
                    {
                      question: state.question,
                      missResponses: state.missResponses,
                    },
                  ]
              ).concat(state.history),
            }
        : {
            ...state,
            historyCursor:
              state.historyCursor === 0 ? undefined : state.historyCursor - 1,
          };
    case "add":
      return state.words === undefined
        ? state
        : { ...state, words: state.words.concat([action.payload]) };
    case "loaded":
      return {
        ...state,
        words: action.payload,
        question: createQuestion(action.payload),
      };
  }
}

export function getInitialState(): State {
  return { done: false, missResponses: [], history: [] };
}
