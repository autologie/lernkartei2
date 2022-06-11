import { Random } from "./Random";
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
  createRelatedWordQuestion,
  createTranslateFromQuestion,
  createTranslateToQuestion,
  HARD_QUESTIONS,
  isAvailable,
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
    const easyMastered = isEasyMastered(progressForDefinition);
    const hardMastered = isHardMastered(progressForDefinition);

    ret.values[i] = { value: 0, values: {} };

    for (const t of questionTypes) {
      if (!isAvailable(word, i, t)) {
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
                  (a, k) =>
                    a * ((progress.table[ii]?.table[k]?.certainty ?? 0) / 3),
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
          : Math.sqrt(currentTick - progress.lastTick);
      const typeTimePassedFactor =
        progressForType?.certainty === 3 || typeLastTick === 0
          ? 1
          : Math.sqrt(currentTick - typeLastTick);
      const value =
        wordTimePassedFactor *
        typeTimePassedFactor *
        (progressForDefinition.lastTick === 0 ||
        progressForType?.certainty === 3 ||
        currentTick - progress.lastTick < 3
          ? 1
          : totalWordCount / Math.pow(2, progressForType?.certainty ?? 0) / 2) *
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
  progress: LearningProgress,
  random: Random
): [Word, number, Question["type"], boolean, Weights] {
  const empty = { value: 0, values: {} };
  const weights = getWeights(words, progress);
  let cursor = weights.value * random();

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

        const shouldShowChoices = HARD_QUESTIONS.every(
          (t) =>
            (progress.table[word.german]?.table[i]?.table[t]?.certainty ?? 0) <
            2
        );

        return [word, i, type, shouldShowChoices, weights];
      }
    }
  }

  throw Error();
}

export function createQuestion(
  progress: LearningProgress,
  words: Word[],
  random: Random
): [Question | undefined, Weights] {
  const [word, definitionIndex, questionType, chooseFrom, weights] =
    getQuestionParams(words, progress, random);
  const commonArgs = [word, definitionIndex, words, random] as const;

  function createQuestion() {
    switch (questionType) {
      case "synonym":
      case "antonym":
      case "generic-term":
      case "sub-term":
        return createRelatedWordQuestion(...commonArgs, questionType);
      case "photo":
        return createPhotoQuestion(...commonArgs, chooseFrom);
      case "fill-blank":
        return createFillBlankQuestion(...commonArgs, chooseFrom);
      case "define":
        return createDefineQuestion(...commonArgs);
      case "translate-to":
        return createTranslateToQuestion(...commonArgs);
      case "translate-from":
        return createTranslateFromQuestion(...commonArgs, chooseFrom);
    }
  }

  return [createQuestion(), weights];
}
