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
      if (
        state.historyCursor !== 0 ||
        state.history.length === 0 ||
        state.done
      ) {
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
        ? { ...state, historyCursor: state.historyCursor + 1 }
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

      return { ...state, historyCursor: state.historyCursor - 1 };
    case "skip":
      return setNewQuestion(state);
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
    history: question === null ? [] : [{ missResponses: [], question }],
    historyCursor: 0,
    settings,
    progress,
    weights,
    words,
  };
}
