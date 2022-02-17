import { createQuestion, Question } from "./Question";
import { Word } from "./Word";

export interface State {
  words?: Word[];
  question?: Question;
  response?: number;
  respondedWrongly: boolean;
}

export type Action =
  | { type: "respond"; payload: number }
  | { type: "next" }
  | { type: "add"; payload: Word }
  | { type: "loaded"; payload: Word[] };

export function applyAction(state: State, action: Action): State {
  switch (action.type) {
    case "respond":
      return state.question === undefined
        ? state
        : {
            ...state,
            response: action.payload,
            respondedWrongly:
              state.respondedWrongly ||
              state.question.answerIndex !== action.payload,
          };
    case "next":
      return state.words === undefined
        ? state
        : {
            ...state,
            question: createQuestion(state.words),
            response: undefined,
            respondedWrongly: false,
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
  return { respondedWrongly: false };
}
