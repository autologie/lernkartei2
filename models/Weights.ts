import { LearningProgress } from "./LearningProgress";
import {
  createDefineQuestion,
  createFillBlankQuestion,
  createPhotoQuestion,
  createTranslateFromQuestion,
  createTranslateToQuestion,
  Question,
  QuestionTable,
  questionTypes,
} from "./Question";
import { Word } from "./Word";

export type Weights = QuestionTable<number>;

function getWeight(
  currentTick: number,
  totalWordCount: number,
  word: Word,
  progress: LearningProgress["table"][string] = {}
): Weights[string] {
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

    ret[i] = {};

    for (const t of questionTypes) {
      const progressForType = progressForDefinition[t];
      const typeLastTick = progressForType?.lastEncounteredTick ?? 0;

      ret[i]![t] =
        (typeLastTick === 0
          ? 1
          : definitionLastTick === 0
          ? 2
          : wordLastTick === 0
          ? 3
          : currentTick - wordLastTick < 2
          ? 0.1
          : Math.pow(currentTick - typeLastTick, 2)) *
        (Math.pow(
          2,
          progressForType?.certainty === undefined
            ? 1
            : progressForType.certainty === 3
            ? 1 / totalWordCount
            : progressForType.certainty + 1
        ) -
          1) *
        (["define", "fill-blank"].includes(t)
          ? questionTypes.reduce(
              (p, tt) =>
                p + (t === tt ? 0 : progressForDefinition[tt]?.certainty ?? 0),
              0.1
            )
          : 6) *
        (i === 0
          ? 1
          : Object.values(progress[i - 1] ?? {}).some((k) => k.certainty === 3)
          ? 1
          : 0.1);
    }
  }

  return ret;
}

export function createWeights(
  words: Word[],
  progress: LearningProgress
): Weights {
  const m = Object.entries(progress.table).reduce<Weights>(
    (passed, [word, entry]) => {
      const w = words.find((w) => w.german === word);

      if (w !== undefined) {
        passed[word] = getWeight(progress.tick, words.length, w, entry);
      }

      return passed;
    },
    {}
  );

  return m;
}

function findRandom(words: Word[], weights: Weights): [Word, Question["type"]] {
  const scores = Object.values(weights).flatMap((p) =>
    Object.values(p ?? {}).flatMap((pp) => Object.values(pp ?? {}))
  );
  const fallback = scores.length > 0 ? Math.min(...scores) : 1;

  const sum = words.reduce(
    (p0, word) =>
      p0 +
      word.definitions.reduce(
        (p1, _, di) =>
          p1 +
          questionTypes.reduce(
            (p2, t) => p2 + (weights[word.german]?.[di]?.[t] ?? fallback),
            0
          ),
        0
      ),
    0
  );

  const cursor = sum * Math.random();
  let current = 0;

  for (const word of words) {
    for (let i = 0; i < word.definitions.length; i++) {
      for (const t of questionTypes) {
        current += weights[word.german]?.[i]?.[t] ?? fallback;

        if (current >= cursor) {
          return [word, t];
        }
      }
    }
  }

  throw Error();
}

export function createQuestion(
  weights: Weights,
  words: Word[]
): Question | undefined {
  function createQuestionImpl(retries: number): Question | undefined {
    try {
      if (retries > 10) {
        return undefined;
      }

      const [word, questionType] = findRandom(words, weights);

      switch (questionType) {
        case "define":
          return createDefineQuestion(word, words);
        case "fill-blank":
          return createFillBlankQuestion(word, words);
        case "translate-from":
          return createTranslateFromQuestion(word, words);
        case "translate-to":
          return createTranslateToQuestion(word, words);
        case "photo":
          return createPhotoQuestion(word, words);
      }
    } catch (e) {
      return createQuestionImpl(retries + 1);
    }
  }

  return createQuestionImpl(0);
}
