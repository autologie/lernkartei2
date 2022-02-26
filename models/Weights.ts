import {
  isEasyMastered,
  isHardMastered,
  LearningProgress,
  WordLearningProgress,
} from "./LearningProgress";
import {
  createDefineQuestion,
  createFillBlankQuestion,
  createPhotoQuestion,
  createTranslateFromQuestion,
  createTranslateToQuestion,
  HARD_QUESTIONS,
  Question,
  questionTypes,
} from "./Question";
import { Word } from "./Word";

export interface DefinitionWeights {
  value: number;
  values: { [key in Question["type"]]?: number };
}

export interface WordWeights {
  value: number;
  values: {
    [definitionIndex: number]: DefinitionWeights | undefined;
  };
}

export interface Weights {
  value: number;
  values: {
    [word: string]: WordWeights | undefined;
  };
}

function getWordWeight(
  currentTick: number,
  totalWordCount: number,
  word: Word,
  progress: WordLearningProgress
): WordWeights {
  const ret: WordWeights = { value: 0, values: {} };

  for (let i = 0; i < word.definitions.length; i++) {
    const progressForDefinition = progress.table[i] ?? {
      table: {},
      lastTick: 0,
    };

    const def = word.definitions[i];
    const easyMastered = isEasyMastered(progressForDefinition);
    const hardMastered = isHardMastered(progressForDefinition);

    ret.values[i] = { value: 0, values: {} };

    for (const t of questionTypes) {
      if (
        (t === "photo" && (def.photos ?? []).length === 0) ||
        (t === "fill-blank" && def.examples.length === 0) ||
        ((t === "translate-from" || t === "translate-to") &&
          def.english.length === 0)
      ) {
        ret.values[i]!.values[t] = 0;
        continue;
      }

      const progressForType = progressForDefinition.table[t];
      const typeLastTick = progressForType?.lastTick ?? 0;
      const definitionIndexFactor =
        i === 0
          ? 1
          : Array.from({ length: i }).reduce<number>(
              (a, _, ii) =>
                a *
                questionTypes.reduce<number>(
                  (a, k) => a * (progress.table[ii]?.table[k]?.certainty ?? 0),
                  1
                ),
              1
            );
      const hardnessFactor = HARD_QUESTIONS.includes(t)
        ? easyMastered
          ? hardMastered
            ? 0.5
            : 1
          : hardMastered
          ? 0.3
          : 0.5
        : easyMastered
        ? hardMastered
          ? 0.5
          : 0.5
        : hardMastered
        ? 0.3
        : 0.5;
      const wordTimePassedFactor =
        hardMastered || progress.lastTick === 0
          ? 1
          : currentTick - progress.lastTick;
      const definitionTimePassedFactor =
        hardMastered || progressForDefinition.lastTick === 0
          ? 1
          : currentTick - progressForDefinition.lastTick;
      const typeTimePassedFactor =
        hardMastered || typeLastTick === 0 ? 1 : currentTick - typeLastTick;
      const value =
        wordTimePassedFactor *
        definitionTimePassedFactor *
        typeTimePassedFactor *
        (progressForType?.certainty === 3
          ? 1
          : totalWordCount / Math.pow(2, progressForType?.certainty ?? 0)) *
        hardnessFactor *
        definitionIndexFactor;

      ret.values[i]!.values[t] = value;
      ret.values[i]!.value += value;
      ret.value += value;
    }
  }

  return ret;
}

function getWeights(words: Word[], progress: LearningProgress): Weights {
  return words.reduce<Weights>(
    (passed, word) => {
      const weight = getWordWeight(
        progress.count,
        words.length,
        word,
        progress.table[word.german] ?? { table: {}, lastTick: 0 }
      );

      passed.values[word.german] = weight;
      passed.value += weight.value;

      return passed;
    },
    { value: 0, values: {} }
  );
}

function getQuestionParams(
  words: Word[],
  progress: LearningProgress
): [Word, number, Question["type"], Weights] {
  const empty = { value: 0, values: {} };
  const weights = getWeights(words, progress);
  let cursor = weights.value * Math.random();

  for (const word of words) {
    const wordWeight = weights.values[word.german] ?? empty;

    if (cursor > wordWeight.value) {
      cursor -= wordWeight.value;
      continue;
    }

    for (let i = 0; i < word.definitions.length; i++) {
      const definitionWeight = wordWeight?.values[i] ?? empty;

      if (cursor > definitionWeight.value) {
        cursor -= definitionWeight.value;
        continue;
      }

      for (const type of questionTypes) {
        const typeWeight = (definitionWeight.values as any)[type] ?? 0;

        if (cursor > typeWeight) {
          cursor -= typeWeight;
          continue;
        }

        return [word, i, type, weights];
      }
    }
  }

  throw Error();
}

export function createQuestion(
  progress: LearningProgress,
  words: Word[]
): [Question | undefined, Weights] {
  const [word, definitionIndex, questionType, weights] = getQuestionParams(
    words,
    progress
  );

  switch (questionType) {
    case "define":
      return [createDefineQuestion(word, definitionIndex, words), weights];
    case "fill-blank":
      return [createFillBlankQuestion(word, definitionIndex, words), weights];
    case "translate-from":
      return [
        createTranslateFromQuestion(word, definitionIndex, words),
        weights,
      ];
    case "translate-to":
      return [createTranslateToQuestion(word, definitionIndex, words), weights];
    case "photo":
      return [createPhotoQuestion(word, definitionIndex, words), weights];
  }
}
