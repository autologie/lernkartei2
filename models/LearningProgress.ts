import { Certainty, fromNumber } from "./Certainty";
import { LearningLog } from "./LearningLog";
import {
  EASY_QUESTIONS,
  HARD_QUESTIONS,
  Question,
  QuestionTable,
} from "./Question";

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
  const tick = progress.tick;

  return {
    ...progress,
    tick: tick + 1,
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

export function isEasyMastered(
  progress: NonNullable<LearningProgress["table"][string]>[number]
): boolean {
  return EASY_QUESTIONS.some((q) => progress?.[q]?.certainty === 3);
}

export function isHardMastered(
  progress: NonNullable<LearningProgress["table"][string]>[number]
): boolean {
  return HARD_QUESTIONS.every((q) => progress?.[q]?.certainty === 3);
}

export function isMastered(
  progress: NonNullable<LearningProgress["table"][string]>[number]
): boolean {
  return isHardMastered(progress) && isEasyMastered(progress);
}
