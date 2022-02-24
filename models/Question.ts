import { Word } from "./Word";
import { getRandomIndex, shuffle } from "./Array";

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
  choices: { word: string; definition: string; definitionIndex: number }[];
  answerIndex: number;
}

export interface TranslateTo {
  type: "translate-to";
  word: string;
  definitionIndex: number;
  choices: {
    word: string;
    definitionIndex: number;
    english: string;
    englishIndex: number;
  }[];
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

export const HARD_QUESTIONS: Question["type"][] = ["define", "fill-blank"];

export const EASY_QUESTIONS: Question["type"][] = [
  "translate-to",
  "translate-from",
  "photo",
];

export interface QuestionTable<T> {
  [word: string]:
    | {
        [definitionIndex: number]:
          | { [key in Question["type"]]?: T }
          | undefined;
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

export function shuffleChoices(question: Question): Question {
  const choices = shuffle(question.choices as any) as any; // TODO

  return {
    ...question,
    choices,
    answerIndex: choices.indexOf(question.choices[question.answerIndex]),
  };
}

export function createDefineQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[]
): Question {
  return shuffleChoices({
    type: "define",
    word: word.german,
    definitionIndex,
    choices: [
      {
        word: word.german,
        definitionIndex,
        definition: word.definitions[definitionIndex].definition,
      },
      ...shuffle(
        words.flatMap((w) =>
          w === word || w.partOfSpeech !== word.partOfSpeech
            ? []
            : Array.from({ length: w.definitions.length }).map(
                (_, definitionIndex) => ({
                  word: w.german,
                  definitionIndex,
                  definition: w.definitions[definitionIndex].definition,
                })
              )
        )
      ).slice(0, 4),
    ],
    answerIndex: 0,
  });
}

export function createFillBlankQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[]
): Question {
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
  definitionIndex: number,
  words: Word[]
): Question {
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

export function createTranslateToQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[]
): Question {
  const englishIndex = getRandomIndex(
    word.definitions[definitionIndex].english
  );

  return shuffleChoices({
    type: "translate-to",
    word: word.german,
    definitionIndex,
    choices: [
      {
        word: word.german,
        definitionIndex,
        englishIndex,
        english: word.definitions[definitionIndex].english[englishIndex],
      },
      ...shuffle(
        words.flatMap((w) =>
          w === word || w.partOfSpeech !== word.partOfSpeech
            ? []
            : w.definitions.flatMap((d, definitionIndex) =>
                d.english.map((english, englishIndex) => ({
                  word: w.german,
                  definitionIndex,
                  englishIndex,
                  english,
                }))
              )
        )
      ).slice(0, 4),
    ],
    answerIndex: 0,
  });
}

export function createPhotoQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[]
): Question {
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
    ],
    answerIndex: 0,
  });
}
