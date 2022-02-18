import {
  createDefineQuestion,
  createFillBlankQuestion,
  createTranslateFromQuestion,
  createTranslateToQuestion,
  Question,
  questionTypes,
  shuffleChoices,
} from "./Question";
import { Word } from "./Word";
import { getRandomElement } from "./Array";

export interface HistoryItem {
  question: Question;
  missResponses: number[];
}

function createQuestionImpl(
  history: HistoryItem[],
  words: Word[],
  retries: number
): Question | undefined {
  try {
    if (retries > 10) {
      return undefined;
    }

    const INVISIBLE_PERIOD = 2;
    const [missedQuestions] = history.reduce<
      [Question[], { [word: string]: number }]
    >(
      ([misses, hits], h, i) => {
        const word = h.question.word.german;

        if (h.missResponses.length === 0) {
          hits[word] = (hits[word] ?? 0) + 1;
        } else if ((hits[word] ?? 0) <= 2 && i >= INVISIBLE_PERIOD) {
          misses.push(h.question);
        }

        return [misses, hits];
      },
      [[], {}]
    );

    if (missedQuestions.length > 0) {
      return shuffleChoices(getRandomElement(missedQuestions));
    }

    const practicedWords = history.map((h) => h.question.word.german);
    const word = getRandomElement(
      words.filter((w) => !practicedWords.includes(w.german))
    );

    switch (getRandomElement(questionTypes)) {
      case "define":
        return createDefineQuestion(word, words);
      case "fill-blank":
        return createFillBlankQuestion(word, words);
      case "translate-from":
        return createTranslateFromQuestion(word, words);
      case "translate-to":
        return createTranslateToQuestion(word, words);
    }
  } catch (e) {
    return createQuestionImpl(history, words, retries + 1);
  }
}

export function createQuestion(
  history: HistoryItem[],
  words: Word[]
): Question | undefined {
  return createQuestionImpl(history, words, 0);
}
