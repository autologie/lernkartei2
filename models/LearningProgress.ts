import { Certainty, fromNumber } from "./Certainty";
import { LearningLog } from "./LearningLog";
import {
  EASY_QUESTIONS,
  HARD_QUESTIONS,
  Question,
  questionTypes,
} from "./Question";

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

  return {
    ...progress,
    count: progress.count + 1,
    table: {
      ...progress.table,
      [word]: {
        lastTick: progress.count,
        table: {
          ...entry.table,
          [definitionIndex]: questionTypes.reduce<DefinitionLearningProgress>(
            (passed, t) => {
              const subEntry = passed.table[t];

              if (t === questionType) {
                passed.table[t] = {
                  miss: (subEntry?.miss ?? false) || miss,
                  lastTick: progress.count,
                  certainty: miss
                    ? 0
                    : subEntry?.miss ?? false
                    ? fromNumber((subEntry?.certainty ?? 0) + 1)
                    : 3,
                };
              } else if (miss && subEntry?.certainty !== undefined) {
                passed.table[t] = {
                  ...subEntry,
                  certainty: fromNumber(subEntry.certainty - 1),
                };
              }

              return passed;
            },
            {
              table: {},
              ...entry.table[definitionIndex],
              lastTick: progress.count,
            }
          ),
        },
      },
    },
  };
}

export function restoreFromLogs(
  logs: LearningLog[],
  initial?: LearningProgress
): LearningProgress {
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
      initial ?? {
        count: 0,
        table: {},
      }
    );
}

function isMasteredTypes(
  questionTypes: Question["type"][],
  progress: DefinitionLearningProgress
): boolean {
  let hasMaxCertainty = false;

  for (const q of questionTypes) {
    const certainty = progress.table?.[q]?.certainty;

    if (certainty !== undefined && certainty < 3) {
      return false;
    }

    hasMaxCertainty = hasMaxCertainty || certainty === 3;
  }

  return hasMaxCertainty;
}

export function isEasyMastered(progress: DefinitionLearningProgress): boolean {
  return isMasteredTypes(EASY_QUESTIONS, progress);
}

export function isHardMastered(progress: DefinitionLearningProgress): boolean {
  return isMasteredTypes(HARD_QUESTIONS, progress);
}

export function isMastered(progress: DefinitionLearningProgress): boolean {
  return isHardMastered(progress) && isEasyMastered(progress);
}

export function hasMissedAtLeastOnce(
  progress: DefinitionLearningProgress
): boolean {
  return Object.values(progress.table).some(
    (typeProgress) => typeProgress.miss
  );
}
