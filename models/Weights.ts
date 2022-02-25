import {
  isEasyMastered,
  isHardMastered,
  LearningProgress,
} from "./LearningProgress";
import {
  createDefineQuestion,
  createFillBlankQuestion,
  createPhotoQuestion,
  createTranslateFromQuestion,
  createTranslateToQuestion,
  HARD_QUESTIONS,
  Question,
  QuestionTable,
  questionTypes,
} from "./Question";
import { Word } from "./Word";

export type Weights = QuestionTable<number | undefined>;

function getWordWeight(
  currentTick: number,
  totalWordCount: number,
  word: Word,
  progress: LearningProgress["table"][string] = {}
): [Weights[string], number] {
  let sum = 0;
  const ret: Weights[string] = {};
  const wordLastTick = Math.max(
    0,
    ...Object.values(progress).flatMap((p) =>
      Object.values(p ?? {}).map((pp) => pp.lastEncounteredTick ?? 0)
    )
  );

  for (let i = 0; i < word.definitions.length; i++) {
    const progressForDefinition = progress[i] ?? {};
    const definitionLastTick = Math.max(
      0,
      ...Object.values(progressForDefinition).map(
        (pp) => pp.lastEncounteredTick ?? 0
      )
    );

    const def = word.definitions[i];
    const easyMastered = isEasyMastered(progressForDefinition);
    const hardMastered = isHardMastered(progressForDefinition);

    ret[i] = {};

    for (const t of questionTypes) {
      if (
        (t === "photo" && (def.photos ?? []).length === 0) ||
        (t === "fill-blank" && def.examples.length === 0) ||
        ((t === "translate-from" || t === "translate-to") &&
          def.english.length === 0)
      ) {
        ret[i]![t] = 0;
        continue;
      }

      const progressForType = progressForDefinition[t];
      const typeLastTick = progressForType?.lastEncounteredTick ?? 0;
      const definitionIndexFactor =
        i === 0
          ? 1
          : Array.from({ length: i }).reduce<number>(
              (a, _, ii) =>
                a *
                questionTypes.reduce<number>(
                  (a, k) => a * (progress[ii]?.[k]?.certainty ?? 0),
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
        hardMastered || wordLastTick === 0 ? 1 : currentTick - wordLastTick;
      const definitionTimePassedFactor =
        hardMastered || definitionLastTick === 0
          ? 1
          : currentTick - definitionLastTick;
      const typeTimePassedFactor =
        hardMastered || typeLastTick === 0 ? 1 : currentTick - typeLastTick;
      const value =
        wordTimePassedFactor *
        definitionTimePassedFactor *
        typeTimePassedFactor *
        (progressForType?.certainty === 3 ? 1 : totalWordCount) *
        hardnessFactor *
        definitionIndexFactor;

      ret[i]![t] = value;
      sum += value;
    }
  }

  return [ret, sum];
}

function getQuestionParams(
  words: Word[],
  progress: LearningProgress
): [Word, number, Question["type"], Weights] {
  const [weights, sum] = words.reduce<[Weights, number]>(
    ([passed, s], word) => {
      const [weight, localSum] = getWordWeight(
        progress.tick,
        words.length,
        word,
        progress.table[word.german]
      );

      passed[word.german] = weight;

      return [passed, s + localSum];
    },
    [{}, 0]
  );

  let cursor = sum * Math.random();

  for (const word of words) {
    for (let i = 0; i < word.definitions.length; i++) {
      for (const t of questionTypes) {
        cursor -= weights[word.german]?.[i]?.[t] ?? 0;

        if (cursor <= 0) {
          return [word, i, t, weights];
        }
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
