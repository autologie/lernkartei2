import { Certainty, fromNumber } from "./Certainty";
import { LearningLog } from "./LearningLog";
import { EASY_QUESTIONS, HARD_QUESTIONS, Question } from "./Question";

export interface TypeLearningProgress {
  miss: boolean;
  certainty?: Certainty;
  lastTick: number;
}

export interface DefinitionLearningProgress {
  lastTick: number;
  table: { [key in Question["type"]]?: TypeLearningProgress };
}

export interface WordLearningProgress {
  lastTick: number;
  table: {
    [definitionIndex: number]: DefinitionLearningProgress | undefined;
  };
}

export interface LearningProgress {
  count: number;
  table: {
    [word: string]: WordLearningProgress | undefined;
  };
}

export function addResult(
  progress: LearningProgress,
  word: string,
  definitionIndex: number,
  questionType: Question["type"],
  miss: boolean
): LearningProgress {
  const empty = { table: {}, lastTick: 0 };
  const entry = progress.table[word] ?? empty;
  const subEntry = entry.table[definitionIndex]?.table[questionType];

  return {
    ...progress,
    count: progress.count + 1,
    table: {
      ...progress.table,
      [word]: {
        lastTick: progress.count,
        table: {
          ...entry.table,
          [definitionIndex]: {
            lastTick: progress.count,
            table: {
              ...entry.table[definitionIndex]?.table,
              [questionType]: {
                miss: (subEntry?.miss ?? false) || miss,
                lastTick: progress.count,
                certainty: miss
                  ? 0
                  : subEntry?.miss ?? false
                  ? fromNumber((subEntry?.certainty ?? 0) + 1)
                  : 3,
              },
            },
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

export function isEasyMastered(progress: DefinitionLearningProgress): boolean {
  return EASY_QUESTIONS.some((q) => progress.table?.[q]?.certainty === 3);
}

export function isHardMastered(progress: DefinitionLearningProgress): boolean {
  return HARD_QUESTIONS.some((q) => progress.table?.[q]?.certainty === 3);
}

export function isMastered(progress: DefinitionLearningProgress): boolean {
  return isHardMastered(progress) && isEasyMastered(progress);
}
