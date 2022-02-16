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
  definitionIndex: number;
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
      .map((w) => getRandomElement(w.definitions)?.definition)
      .filter((v): v is string => v !== undefined),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

function createFillBlankQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);
  const definitionIndex =
    word === undefined ? undefined : getRandomIndex(word.definitions);
  const exampleIndex =
    word === undefined || definitionIndex === undefined
      ? undefined
      : getRandomIndex(word.definitions[definitionIndex].examples);

  if (
    word === undefined ||
    definitionIndex === undefined ||
    exampleIndex === undefined
  ) {
    return;
  }

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

function createTranslateFromQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);
  const definitionIndex =
    word === undefined ? undefined : getRandomIndex(word.definitions);
  const englishIndex =
    word === undefined || definitionIndex === undefined
      ? undefined
      : getRandomIndex(word.definitions[definitionIndex].english);

  if (
    word === undefined ||
    definitionIndex === undefined ||
    englishIndex === undefined
  ) {
    return;
  }

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

function createTranslateToQuestion(words: Word[]): Question | undefined {
  const word = getRandomElement(words);
  const definition =
    word === undefined ? undefined : getRandomElement(word.definitions);

  if (
    word === undefined ||
    definition === undefined ||
    definition.english.length === 0
  ) {
    return;
  }

  const question: Question = {
    type: "translate-to",
    word,
    choices: [
      definition,
      ...shuffle(words.flatMap((w) => (w === word ? [] : w.definitions))).slice(
        0,
        4
      ),
    ]
      .map((w) => getRandomElement(w.english))
      .filter((v): v is string => v !== undefined),
    answerIndex: 0,
  };

  return shuffleChoices(question);
}

export function createQuestion(words: Word[]): Question | undefined {
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

  for (let i = 0; i < 10; i++) {
    const maybeCreated = tryCreate();

    if (maybeCreated !== undefined) {
      return maybeCreated;
    }
  }
}
