import { Word } from "./Word";
import { getRandomElement, getRandomIndex, shuffle } from "./Array";

export interface FillBlank {
  type: "fill-blank";
  word: Word;
  definitionIndex: number;
  exampleIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface Define {
  type: "define";
  word: Word;
  definitionIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface TranslateTo {
  type: "translate-to";
  word: Word;
  definitionIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface TranslateFrom {
  type: "translate-from";
  word: Word;
  definitionIndex: number;
  englishIndex: number;
  choices: string[];
  answerIndex: number;
}

export type Question = FillBlank | Define | TranslateTo | TranslateFrom;

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
  const question: Question = {
    type: "define",
    word,
    definitionIndex,
    choices: [
      word.definitions[definitionIndex],
      ...shuffle(words.flatMap((w) => (w === word ? [] : w.definitions))).slice(
        0,
        4
      ),
    ]
      .map((w) => w.definition)
      .filter((v): v is string => v !== undefined),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

export function createFillBlankQuestion(word: Word, words: Word[]): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const exampleIndex = getRandomIndex(
    word.definitions[definitionIndex].examples
  );
  const question: Question = {
    type: "fill-blank",
    word,
    definitionIndex,
    exampleIndex,
    choices: [
      word,
      ...shuffle(words.filter((w) => w !== word)).slice(0, 4),
    ].map((w) => w.german),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

export function createTranslateFromQuestion(
  word: Word,
  words: Word[]
): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const englishIndex = getRandomIndex(
    word.definitions[definitionIndex].english
  );
  const question: Question = {
    type: "translate-from",
    word,
    definitionIndex,
    englishIndex,
    choices: [
      word,
      ...shuffle(words.filter((w) => w !== word)).slice(0, 4),
    ].map((w) => w.german),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

export function createTranslateToQuestion(word: Word, words: Word[]): Question {
  const definitionIndex = getRandomIndex(word.definitions);
  const english = getRandomElement(word.definitions[definitionIndex].english);
  const question: Question = {
    type: "translate-to",
    word,
    definitionIndex,
    choices: [
      english,
      ...shuffle(
        words.flatMap((w) =>
          w === word ? [] : w.definitions.flatMap((d) => d.english)
        )
      ).slice(0, 4),
    ].filter((v): v is string => v !== undefined),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}
