import { HistoryItem } from "./HistoryItem";
import { addResult, LearningProgress } from "./LearningProgress";
import { Question } from "./Question";
import { Settings, test } from "./Settings";
import { createQuestion, createWeights, Weights } from "./Weights";
import { Word } from "./Word";

export interface State {
  words: Word[];
  done: boolean;
  history: HistoryItem[];
  progress: LearningProgress;
  weights: Weights;
  historyCursor: number;
  prevHistoryCursor?: number;
  settings: Settings;
  sessionId: string;
  modal?:
    | { type: "search"; word: string }
    | { type: "qr-code" }
    | { type: "word"; word: Word; message?: string }
    | { type: "configure-word"; word: Word }
    | { type: "explain-choice"; item: HistoryItem; choiceIndex: number };
}

export type Action =
  | { type: "respond"; payload: number }
  | { type: "skip" }
  | { type: "search"; payload: string }
  | { type: "back" }
  | { type: "view-word"; payload: Word }
  | { type: "next" }
  | { type: "show-qr-code" }
  | { type: "close-modal" }
  | { type: "add"; payload: Word }
  | { type: "replace"; payload: Word }
  | { type: "remove"; payload: string }
  | { type: "configure-word"; payload: Word };

function setNewQuestion(state: State): State {
  const nextQuestion = createQuestion(state.weights, state.words);

  if (nextQuestion === undefined) {
    return state;
  }

  return {
    ...state,
    done: false,
    history: [{ missResponses: [] as number[], question: nextQuestion }].concat(
      state.history
    ),
  };
}

export function applyAction(state: State, action: Action): State {
  switch (action.type) {
    case "respond": {
      if (state.done || state.historyCursor > 0) {
        return {
          ...state,
          modal: {
            type: "explain-choice",
            item: state.history[state.historyCursor],
            choiceIndex: action.payload,
          },
        };
      }

      if (state.historyCursor !== 0 || state.history.length === 0) {
        return state;
      }

      const item = state.history[0];

      if (item.question.answerIndex === action.payload) {
        const progress = addResult(
          state.progress,
          item.question.word,
          item.question.definitionIndex,
          item.question.type,
          item.missResponses.length > 0
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
        history: [
          { ...item, missResponses: item.missResponses.concat(action.payload) },
        ].concat(state.history.slice(1)),
      };
    }
    case "back": {
      if (state.modal !== undefined) {
        return state;
      }

      return state.historyCursor < state.history.length - 1
        ? {
            ...state,
            historyCursor: state.historyCursor + 1,
            prevHistoryCursor: state.historyCursor,
          }
        : state;
    }
    case "next":
      if (state.modal !== undefined) {
        return state;
      }

      if (state.historyCursor === 0) {
        if (!state.done) {
          return state;
        }

        return setNewQuestion(state);
      }

      return {
        ...state,
        historyCursor: state.historyCursor - 1,
        prevHistoryCursor: state.historyCursor,
      };
    case "skip":
      return setNewQuestion(state);
    case "add":
      return state.words === undefined || !test(state.settings, action.payload)
        ? state
        : {
            ...state,
            words: state.words.concat([action.payload]),
            modal: {
              type: "word",
              word: action.payload,
              message: "Word added",
            },
          };
    case "view-word":
      return { ...state, modal: { type: "word", word: action.payload } };
    case "configure-word":
      return {
        ...state,
        modal: { type: "configure-word", word: action.payload },
      };
    case "search":
      return {
        ...state,
        modal: { type: "search", word: action.payload },
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
    case "show-qr-code":
      return { ...state, modal: { type: "qr-code" } };
  }
}

export interface InitialStateArgs {
  settings: Settings;
  words: Word[];
  progress: LearningProgress;
  question: Question | null;
  sessionId: string;
}

export function getInitialState({
  sessionId,
  settings,
  words,
  progress,
  question,
}: InitialStateArgs): State {
  const weights = createWeights(words, progress);

  return {
    done: false,
    history: question === null ? [] : [{ missResponses: [], question }],
    historyCursor: 0,
    settings,
    progress,
    weights,
    words,
    sessionId,
  };
}

export function shouldShowNavBackButton(state: State): boolean {
  return (
    state.history.length > 0 && state.history.length > state.historyCursor + 1
  );
}

export function shouldShowNavNextButton(state: State): boolean {
  return state.historyCursor > 0;
}

export function shouldShowNextButton(state: State): boolean {
  return (
    (state.history[state.historyCursor]?.missResponses.length ?? 0) > 0 &&
    state.done &&
    state.historyCursor === 0
  );
}

export function shouldShowExplanation(state: State): boolean {
  return (
    state.historyCursor > 0 ||
    (state.done && state.history[state.historyCursor].missResponses.length > 0)
  );
}

export function isNewerQuestion(state: State): boolean {
  return (
    state.historyCursor === 0 ||
    (state.prevHistoryCursor !== undefined &&
      state.prevHistoryCursor > state.historyCursor)
  );
}
