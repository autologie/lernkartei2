import { Word } from "./Word";
import { getRandomElement, shuffle } from "./Array";

export interface FillBlank {
  type: "fill-blank";
  word: Word;
  exampleIndex: number;
  choices: string[];
  answerIndex: number;
}

export interface Define {
  type: "define";
  word: Word;
  choices: string[];
  answerIndex: number;
}

export interface TranslateTo {
  type: "translate-to";
  word: Word;
  choices: string[];
  answerIndex: number;
}

export interface TranslateFrom {
  type: "translate-from";
  word: Word;
  englishIndex: number;
  choices: string[];
  answerIndex: number;
}

export type Question = FillBlank | Define | TranslateTo | TranslateFrom;

function shuffleChoices(question: Question) {
  const choices = shuffle(question.choices);

  return {
    ...question,
    choices: choices,
    answerIndex: choices.indexOf(question.choices[question.answerIndex]),
  };
}

function createDefineQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);

  if (word === undefined) {
    return;
  }

  const question: Question = {
    type: "define",
    word,
    choices: [word, ...shuffle(words.filter((w) => w !== word)).slice(0, 2)]
      .map((w) => getRandomElement(w.definitions))
      .filter((v): v is string => v !== undefined),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

function createFillBlankQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);

  if (word === undefined) {
    return;
  }

  const question: Question = {
    type: "fill-blank",
    word,
    exampleIndex: Math.floor(Math.random() * word.examples.length),
    choices: [
      word,
      ...shuffle(words.filter((w) => w !== word)).slice(0, 2),
    ].map((w) => w.german),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

function createTranslateFromQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);

  if (word === undefined) {
    return;
  }

  const englishIndex = Math.floor(Math.random() * word.english.length);
  const question: Question = {
    type: "translate-from",
    word,
    englishIndex,
    choices: [
      word,
      ...shuffle(words.filter((w) => w !== word)).slice(0, 2),
    ].map((w) => w.german),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

function createTranslateToQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);

  if (word === undefined) {
    return;
  }

  const question: Question = {
    type: "translate-to",
    word,
    choices: [word, ...shuffle(words.filter((w) => w !== word)).slice(0, 2)]
      .map((w) => getRandomElement(w.english))
      .filter((v): v is string => v !== undefined),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

export function createQuestion(words: Word[]): Question {
  const types: Question["type"][] = [
    "define",
    "fill-blank",
    "translate-from",
    "translate-to",
  ];

  function tryCreate(): Question | undefined {
    switch (getRandomElement(types)) {
      case "define":
        return createDefineQuestion(words);
      case "fill-blank":
        return createFillBlankQuestion(words);
      case "translate-from":
        return createTranslateFromQuestion(words);
      case "translate-to":
        return createTranslateToQuestion(words);
    }
  }

  while (true) {
    const maybeCreated = tryCreate();

    if (maybeCreated !== undefined) {
      return maybeCreated;
    }
  }
}
