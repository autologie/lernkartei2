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
  count: number;
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

  return {
    ...progress,
    count: progress.count + 1,
    table: {
      ...progress.table,
      [word]: {
        ...entry,
        [definitionIndex]: {
          ...entry[definitionIndex],
          [questionType]: {
            miss: (subEntry?.miss ?? false) || miss,
            lastEncounteredTick: progress.count,
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
  return [...logs]
    .sort((a, b) => a._ts - b._ts)
    .reduce(
      (passed, log) =>
        addResult(
          passed,
          log.word,
          log.definitionIndex,
          log.questionType,
          log.miss
        ),
      {
        count: 0,
        table: {},
      }
    );
}

export function isEasyMastered(
  progress: NonNullable<LearningProgress["table"][string]>[number]
): boolean {
  return EASY_QUESTIONS.some((q) => progress?.[q]?.certainty === 3);
}

export function isHardMastered(
  progress: NonNullable<LearningProgress["table"][string]>[number]
): boolean {
  return HARD_QUESTIONS.some((q) => progress?.[q]?.certainty === 3);
}

export function isMastered(
  progress: NonNullable<LearningProgress["table"][string]>[number]
): boolean {
  return isHardMastered(progress) && isEasyMastered(progress);
}
