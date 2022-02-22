import { Certainty, fromNumber } from "./Certainty";
import { LearningLog } from "./LearningLog";
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
  word: string,
  definitionIndex: number,
  questionType: Question["type"],
  miss: boolean
): LearningProgress {
  const entry = progress.table[word] ?? {};
  const subEntry = entry[definitionIndex]?.[questionType];
  const tick = progress.tick + 1;

  return {
    ...progress,
    tick: tick,
    table: {
      ...progress.table,
      [word]: {
        ...entry,
        [definitionIndex]: {
          ...entry[definitionIndex],
          [questionType]: {
            miss: (subEntry?.miss ?? false) || miss,
            lastEncounteredTick: tick,
            certainty: miss
              ? 0
              : subEntry?.miss ?? false
              ? fromNumber((subEntry?.certainty ?? 0) + 1)
              : 3,
          },
        },
      },
    },
  };
}

export function restoreFromLogs(logs: LearningLog[]): LearningProgress {
  const sorted = [...logs].sort((a, b) => a.tick - b.tick);

  return {
    ...sorted.reduce(
      (passed, log) =>
        addResult(
          passed,
          log.word,
          log.definitionIndex,
          log.questionType,
          log.miss
        ),
      {
        tick: 0,
        table: {},
      }
    ),
    tick: (sorted[sorted.length - 1]?.tick ?? 0) + 1,
  };
}
