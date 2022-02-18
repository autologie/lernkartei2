import { Certainty, fromNumber } from "./Certainty";
import { Question, QuestionTable } from "./Question";

export interface LearningProgressEntry {
  miss: boolean;
  certainty?: Certainty;
  lastEncounteredTick?: number;
}

export interface LearningProgress {
  tick: number;
  table: QuestionTable<LearningProgressEntry>;
}

export function addResult(
  progress: LearningProgress,
  question: Question,
  ok: boolean
): LearningProgress {
  const entry = progress.table[question.word.german] ?? {
    define: { miss: false },
    "fill-blank": { miss: false },
    "translate-from": { miss: false },
    "translate-to": { miss: false },
  };
  const subEntry = entry[question.type];
  const tick = progress.tick + 1;

  return {
    ...progress,
    tick: tick,
    table: {
      ...progress.table,
      [question.word.german]: {
        ...entry,
        [question.type]: {
          miss: subEntry.miss || !ok,
          lastEncounteredTick: tick,
          certainty: ok
            ? subEntry.miss
              ? fromNumber((subEntry.certainty ?? 0) + 1)
              : 3
            : 0,
        },
      },
    },
  };
}
