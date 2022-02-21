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
  const entry = progress.table[question.word] ?? {};
  const subEntry = entry[question.definitionIndex]?.[question.type];
  const tick = progress.tick + 1;

  return {
    ...progress,
    tick: tick,
    table: {
      ...progress.table,
      [question.word]: {
        ...entry,
        [question.definitionIndex]: {
          ...entry[question.definitionIndex],
          [question.type]: {
            miss: (subEntry?.miss ?? false) || !ok,
            lastEncounteredTick: tick,
            certainty: ok
              ? subEntry?.miss ?? false
                ? fromNumber((subEntry?.certainty ?? 0) + 1)
                : 3
              : 0,
          },
        },
      },
    },
  };
}
