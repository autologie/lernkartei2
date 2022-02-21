import { getRandomElement } from "./Array";
import { LearningProgress, LearningProgressEntry } from "./LearningProgress";
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
  definitionIndex: number,
  type: Question["type"],
  entry: LearningProgress["table"][string]
): number {
  const subEntry = entry?.[definitionIndex]?.[type];
  const INVISIBLE_DURATION = 1;

  if (entry === undefined) {
    // new word
    return 8;
  }

  const lastTick = Object.values(entry)
    .flatMap((v) => Object.values(v ?? {}))
    .reduce<number | undefined>(
      (a, b) =>
        a === undefined
          ? b.lastEncounteredTick
          : b.lastEncounteredTick === undefined
          ? a
          : Math.max(a, b.lastEncounteredTick),
      undefined
    );

  if (lastTick !== undefined && currentTick < lastTick + INVISIBLE_DURATION) {
    // word that is seen very recently
    return 0;
  }

  if (subEntry === undefined) {
    // word that is already seen, but not asked in this question type
    return 3;
  }

  if (subEntry.certainty === 3) {
    // already remembered word (hopefully)
    return 1;
  }

  if (
    Object.values(entry).some((e) =>
      Object.values(e ?? {}).some((se) => se.miss)
    )
  ) {
    // question that is wrongly answered before
    return Math.max(1, currentTick - (lastTick ?? 0)) * totalWordCount;
  }

  return 5;
}

export function createWeights(
  words: Word[],
  progress: LearningProgress
): Weights {
  return Object.entries(progress.table).reduce<Weights>(
    (passed, [word, entry]) => {
      if (passed[word] === undefined) {
        passed[word] = {};
      }

      Object.entries(entry ?? {}).forEach(([definitionIndex_]) => {
        const definitionIndex = Number.parseInt(definitionIndex_, 10);
        const w = words.find((w) => w.german === word);

        if (w === undefined) {
          return;
        }

        passed[word]![definitionIndex] = questionTypes.reduce<
          NonNullable<NonNullable<Weights[string]>[number]>
        >((passed2, t) => {
          passed2[t] = getWeight(
            progress.tick,
            words.length,
            w,
            definitionIndex,
            t,
            entry
          );

          return passed2;
        }, {});
      }, []);

      return passed;
    },
    {}
  );
}

function getDefaultScore(
  word: Word,
  definitionIndex: number,
  questionType: Question["type"]
): number {
  return 5;
}

function findRandom(words: Word[], weights: Weights): [Word, Question["type"]] {
  const sum = words.reduce(
    (p0, word) =>
      p0 +
      word.definitions.reduce(
        (p1, _, di) =>
          p1 +
          questionTypes.reduce(
            (p2, t) =>
              p2 +
              (weights[word.german]?.[di]?.[t] ?? getDefaultScore(word, di, t)),
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
        current +=
          weights[word.german]?.[i]?.[t] ?? getDefaultScore(word, i, t);

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
