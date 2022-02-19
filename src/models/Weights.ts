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
  type: Question["type"],
  entry?: { [key in Question["type"]]: LearningProgressEntry }
): number {
  const subEntry = entry?.[type];
  const INVISIBLE_DURATION = 1;

  if (entry === undefined) {
    // new word
    return 8;
  }

  const lastTick = Object.values(entry).reduce<number | undefined>(
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

  if (Object.values(entry).some((e) => e.miss)) {
    // question that is wrongly answered before
    return Math.max(1, currentTick - (lastTick ?? 0)) * totalWordCount;
  }

  return 5;
}

export function createWeights(
  words: Word[],
  progress: LearningProgress
): Weights {
  return words.reduce<Weights>((passed, word) => {
    const entry = progress.table[word.german];

    passed[word.german] = {
      define: getWeight(progress.tick, words.length, "define", entry),
      "fill-blank": getWeight(progress.tick, words.length, "fill-blank", entry),
      "translate-from": getWeight(
        progress.tick,
        words.length,
        "translate-from",
        entry
      ),
      "translate-to": getWeight(
        progress.tick,
        words.length,
        "translate-to",
        entry
      ),
      photo: getWeight(progress.tick, words.length, "photo", entry),
    };

    return passed;
  }, {});
}

function findRandom(words: Word[], weights: Weights): [Word, Question["type"]] {
  const cursor =
    Object.values(weights).reduce(
      (a, b) => a + Object.values(b ?? {}).reduce((c, d) => c + d, 0),
      0
    ) * Math.random();
  let current = 0;

  for (const [german, entry] of Object.entries(weights)) {
    if (entry === undefined) {
      continue;
    }

    for (const t of questionTypes) {
      current += entry[t];

      if (current >= cursor) {
        const word = words.find((w) => w.german === german);

        if (word === undefined) {
          throw Error();
        }

        return [word, t];
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
