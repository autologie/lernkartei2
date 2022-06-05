import { createRandomGenerator, Random } from "./Random";
import { HistoryItem } from "./HistoryItem";
import {
  addResult,
  hasMissedAtLeastOnce,
  isMastered,
  LearningProgress,
} from "./LearningProgress";
import { Question } from "./Question";
import { Settings, test } from "./Settings";
import { createQuestion, Weights } from "./Weights";
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
    | { type: "search"; word: string; detailExpand?: string; adding: boolean }
    | { type: "qr-code" }
    | { type: "mastered"; word: Word; definitionIndex: number }
    | { type: "word"; word: Word; message?: string; configure: boolean }
    | { type: "explain-choice"; item: HistoryItem; choiceIndex: number };
}

export type Action =
  | { type: "respond"; payload: number }
  | { type: "skip" }
  | { type: "search"; payload: string }
  | { type: "toggle-detail"; payload: string }
  | { type: "back" }
  | { type: "view-word"; payload: Word }
  | { type: "next" }
  | { type: "show-hint" }
  | { type: "show-qr-code" }
  | { type: "close-modal" }
  | { type: "add" }
  | { type: "added"; payload: Word }
  | { type: "add-failed" }
  | { type: "replace"; payload: Word }
  | { type: "remove"; payload: string }
  | { type: "configure-word"; payload: Word };

function setNewQuestion(state: State, random: Random): State {
  const [nextQuestion, weights] = createQuestion(
    state.progress,
    state.words,
    random
  );

  if (nextQuestion === undefined) {
    return state;
  }

  return {
    ...state,
    done: false,
    modal: undefined,
    weights,
    history: [
      {
        missResponses: [] as number[],
        question: nextQuestion,
        hintUsed: false,
      },
    ].concat(state.history),
  };
}

function applyActionWithRandom(
  state: State,
  action: Action,
  random: Random
): State {
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
        const defProgress = progress.table[item.question.word]?.table[
          item.question.definitionIndex
        ] ?? { table: {}, lastTick: 0 };
        const masteredWord =
          isMastered(defProgress) && hasMissedAtLeastOnce(defProgress)
            ? state.words.find((w) => w.german === item.question.word)
            : undefined;

        return {
          ...state,
          done: true,
          progress,
          modal:
            masteredWord === undefined
              ? undefined
              : {
                  type: "mastered",
                  word: masteredWord,
                  definitionIndex: item.question.definitionIndex,
                },
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
      if (state.modal !== undefined && state.modal.type !== "mastered") {
        return state;
      }

      if (state.historyCursor === 0) {
        if (!state.done) {
          return state;
        }

        return setNewQuestion(state, random);
      }

      return {
        ...state,
        historyCursor: state.historyCursor - 1,
        prevHistoryCursor: state.historyCursor,
      };
    case "skip":
      return setNewQuestion(state, random);
    case "add":
      return state.modal?.type !== "search"
        ? state
        : { ...state, modal: { ...state.modal, adding: true } };
    case "added":
      return state.words === undefined ||
        !test(state.settings, action.payload) ||
        state.modal?.type !== "search"
        ? state
        : {
            ...state,
            words: state.words.concat([action.payload]),
            modal: {
              ...state.modal,
              adding: false,
              detailExpand: action.payload.german,
            },
          };
    case "add-failed":
      return state.words === undefined || state.modal?.type !== "search"
        ? state
        : {
            ...state,
            modal: { ...state.modal, adding: false },
          };
    case "view-word":
      return {
        ...state,
        modal: { type: "word", word: action.payload, configure: false },
      };
    case "configure-word":
      return {
        ...state,
        modal: { type: "word", word: action.payload, configure: true },
      };
    case "search":
      return {
        ...state,
        modal: { type: "search", word: action.payload, adding: false },
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
    case "toggle-detail":
      return state.modal?.type === "search"
        ? {
            ...state,
            modal: {
              ...state.modal,
              detailExpand:
                state.modal.detailExpand === action.payload
                  ? undefined
                  : action.payload,
            },
          }
        : state;
    case "show-hint":
      return state.history.length === 0
        ? state
        : {
            ...state,
            history: [{ ...state.history[0], hintUsed: true }].concat(
              state.history.slice(1)
            ),
          };
  }
}

export interface InitialStateArgs {
  settings: Settings;
  words: Word[];
  progress: LearningProgress;
  sessionId: string;
}

export function getInitialState({
  sessionId,
  settings,
  words,
  progress,
}: InitialStateArgs): State {
  const random = createRandomGenerator(progress.count);
  const [question, weights] = createQuestion(progress, words, random);

  return {
    done: false,
    history:
      question === undefined
        ? []
        : [{ missResponses: [], question, hintUsed: false }],
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

export function applyAction(state: State, action: Action): State {
  const random = createRandomGenerator(state.progress.count);

  return applyActionWithRandom(state, action, random);
}
