import { HistoryItem } from "./HistoryItem";
import { addResult, LearningProgress } from "./LearningProgress";
import { Question } from "./Question";
import { Settings, test } from "./Settings";
import { createQuestion, createWeights, Weights } from "./Weights";
import { Word } from "./Word";

export interface State {
  words: Word[];
  question?: Question;
  done: boolean;
  missResponses: number[];
  history: HistoryItem[];
  progress: LearningProgress;
  weights: Weights;
  historyCursor?: number;
  settings: Settings;
  modal?:
    | { type: "word-added"; word: Word }
    | { type: "configure-word"; word: Word };
}

export type Action =
  | { type: "respond"; payload: number }
  | { type: "skip" }
  | { type: "back" }
  | { type: "next" }
  | { type: "close-modal" }
  | { type: "add"; payload: Word }
  | { type: "replace"; payload: Word }
  | { type: "remove"; payload: string }
  | { type: "configure-word"; payload: Word };

export function applyAction(state: State, action: Action): State {
  switch (action.type) {
    case "respond":
      if (state.question === undefined || state.done) {
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
      if (state.modal !== undefined) {
        return state;
      }

      if (state.historyCursor === undefined) {
        if (state.words === undefined || !state.done) {
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
            question: undefined,
          };
        }

        return {
          ...state,
          question: nextQuestion,
          done: false,
          missResponses: [],
          history,
        };
      }

      return {
        ...state,
        historyCursor:
          state.historyCursor === 0 ? undefined : state.historyCursor - 1,
      };
    case "skip":
      if (state.words === undefined) {
        return state;
      }

      const nextQuestion = createQuestion(state.weights, state.words);

      if (nextQuestion === undefined) {
        return {
          ...state,
        };
      }

      return {
        ...state,
        question: nextQuestion,
        done: false,
        missResponses: [],
      };

    case "add":
      return state.words === undefined || !test(state.settings, action.payload)
        ? state
        : {
            ...state,
            words: state.words.concat([action.payload]),
            modal: { type: "word-added", word: action.payload },
          };
    case "configure-word":
      return {
        ...state,
        modal: { type: "configure-word", word: action.payload },
      };
    case "remove":
      return {
        ...state,
        modal: undefined,
        words: state.words.filter((w) => w.german !== action.payload),
      };
    case "replace":
      return {
        ...state,
        modal: undefined,
        words: state.words.map((w) =>
          w.german === action.payload.german ? action.payload : w
        ),
      };
    case "close-modal":
      return { ...state, modal: undefined };
  }
}

export function getInitialState({
  settings,
  words,
  progress,
  question,
}: {
  settings: Settings;
  words: Word[];
  progress: LearningProgress;
  question: Question | null;
}): State {
  const weights = createWeights(words, progress);

  return {
    done: false,
    missResponses: [],
    history: [],
    settings,
    progress: { table: {}, tick: 0 },
    weights,
    words,
    question: question ?? undefined,
  };
}
