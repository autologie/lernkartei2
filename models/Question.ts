import { Word } from "./Word";
import { getRandomElement, getRandomIndex, shuffle } from "./Array";

export interface FillBlank {
  type: "fill-blank";
  word: string;
  definitionIndex: number;
  exampleIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface Define {
  type: "define";
  word: string;
  definitionIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface TranslateTo {
  type: "translate-to";
  word: string;
  definitionIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface TranslateFrom {
  type: "translate-from";
  word: string;
  definitionIndex: number;
  englishIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface Photo {
  type: "photo";
  word: string;
  definitionIndex: number;
  photoIndex: number;
  choices: string[];
  answerIndex: number;
}

export type Question = FillBlank | Define | TranslateTo | TranslateFrom | Photo;

export interface QuestionTable<T> {
  [word: string]:
    | {
        [key in Question["type"]]?: T;
      }
    | undefined;
}

export const questionTypes: Question["type"][] = [
  "define",
  "fill-blank",
  "translate-from",
  "translate-to",
  "photo",
];

export function shuffleChoices(question: Question) {
  const choices = shuffle(question.choices);

  return {
    ...question,
    choices: choices,
    answerIndex: choices.indexOf(question.choices[question.answerIndex]),
  };
}

export function createDefineQuestion(word: Word, words: Word[]): Question {
  const definitionIndex = getRandomIndex(word.definitions);

  return shuffleChoices({
    type: "define",
    word: word.german,
    definitionIndex,
    choices: [
      word.definitions[definitionIndex],
      ...shuffle(
        words.flatMap((w) =>
          w === word || w.partOfSpeech !== word.partOfSpeech
            ? []
            : w.definitions
        )
      ).slice(0, 4),
    ]
      .map((w) => w.definition)
      .filter((v): v is string => v !== undefined),
    answerIndex: 0,
  });
}

export function createFillBlankQuestion(word: Word, words: Word[]): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const exampleIndex = getRandomIndex(
    word.definitions[definitionIndex].examples
  );

  return shuffleChoices({
    type: "fill-blank",
    word: word.german,
    definitionIndex,
    exampleIndex,
    choices: [
      word,
      ...shuffle(
        words.filter((w) => w !== word && w.partOfSpeech === word.partOfSpeech)
      ).slice(0, 4),
    ].map((w) => w.german),
    answerIndex: 0,
  });
}

export function createTranslateFromQuestion(
  word: Word,
  words: Word[]
): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const englishIndex = getRandomIndex(
    word.definitions[definitionIndex].english
  );

  return shuffleChoices({
    type: "translate-from",
    word: word.german,
    definitionIndex,
    englishIndex,
    choices: [
      word,
      ...shuffle(
        words.filter((w) => w !== word && w.partOfSpeech === word.partOfSpeech)
      ).slice(0, 4),
    ].map((w) => w.german),
    answerIndex: 0,
  });
}

export function createTranslateToQuestion(word: Word, words: Word[]): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const english = getRandomElement(word.definitions[definitionIndex].english);

  return shuffleChoices({
    type: "translate-to",
    word: word.german,
    definitionIndex,
    choices: [
      english,
      ...shuffle(
        words.flatMap((w) =>
          w === word || w.partOfSpeech !== word.partOfSpeech
            ? []
            : w.definitions.flatMap((d) => d.english)
        )
      ).slice(0, 4),
    ].filter((v): v is string => v !== undefined),
    answerIndex: 0,
  });
}

export function createPhotoQuestion(word: Word, words: Word[]): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const photoIndex = getRandomIndex(
    word.definitions[definitionIndex].photos ?? []
  );

  return shuffleChoices({
    type: "photo",
    word: word.german,
    definitionIndex,
    photoIndex,
    choices: [
      word.german,
      ...shuffle(
        words.flatMap((w) =>
          w === word || w.partOfSpeech !== word.partOfSpeech ? [] : [w.german]
        )
      ).slice(0, 4),
    ].filter((v): v is string => v !== undefined),
    answerIndex: 0,
  });
}
