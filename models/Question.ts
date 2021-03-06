import { Word } from "./Word";
import { getRandomIndex, shuffle } from "./Array";
import { Random } from "./Random";
import { createChunks, ExampleTextChunk } from "./ExampleTextChunk";

export interface FillBlank {
  type: "fill-blank";
  word: string;
  definitionIndex: number;
  exampleIndex: number;
  chunks: ExampleTextChunk[];
  chooseFrom: {
    choices: string[];
    answerIndex: number;
  } | null;
}

export interface Define {
  type: "define";
  word: string;
  definitionIndex: number;
  chooseFrom: {
    choices: { word: string; definition: string; definitionIndex: number }[];
    answerIndex: number;
  };
}

export interface TranslateTo {
  type: "translate-to";
  word: string;
  definitionIndex: number;
  chooseFrom: {
    choices: {
      word: string;
      definitionIndex: number;
      english: string;
      englishIndex: number;
    }[];
    answerIndex: number;
  };
}

export interface TranslateFrom {
  type: "translate-from";
  word: string;
  definitionIndex: number;
  englishIndex: number;
  chooseFrom: {
    choices: string[];
    answerIndex: number;
  } | null;
}

export interface Photo {
  type: "photo";
  word: string;
  definitionIndex: number;
  photoIndex: number;
  chooseFrom: {
    choices: string[];
    answerIndex: number;
  } | null;
}

interface RelatedWord {
  word: string;
  definitionIndex: number;
  chooseFrom: {
    choices: string[];
    answerIndex: number;
  };
}

export interface Synonym extends RelatedWord {
  type: "synonym";
}

export interface Antonym extends RelatedWord {
  type: "antonym";
}

export interface GenericTerm extends RelatedWord {
  type: "generic-term";
}

export interface SubTerm extends RelatedWord {
  type: "sub-term";
}

export type Question =
  | FillBlank
  | Define
  | TranslateTo
  | TranslateFrom
  | Photo
  | Synonym
  | Antonym
  | GenericTerm
  | SubTerm;

export const HARD_QUESTIONS: Question["type"][] = ["define", "fill-blank"];

export const EASY_QUESTIONS: Question["type"][] = [
  "translate-to",
  "translate-from",
  "photo",
  "synonym",
  "antonym",
  "generic-term",
  "sub-term",
];

export const questionTypes: Question["type"][] = [
  ...EASY_QUESTIONS,
  ...HARD_QUESTIONS,
];

const keyMapping = {
  synonym: "synonyms",
  antonym: "antonyms",
  "generic-term": "genericTerms",
  "sub-term": "subTerms",
} as const;

export function shuffleChoices(question: Question, random: Random): Question {
  if (question.chooseFrom === null) {
    return question;
  }

  const choices = shuffle(question.chooseFrom.choices as any, random) as any; // TODO

  return {
    ...question,
    chooseFrom: {
      choices,
      answerIndex: choices.indexOf(
        question.chooseFrom.choices[question.chooseFrom.answerIndex]
      ),
    },
  };
}

export function createDefineQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[],
  random: Random
): Question {
  return shuffleChoices(
    {
      type: "define",
      word: word.german,
      definitionIndex,
      chooseFrom: {
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
            ),
            random
          ).slice(0, 4),
        ],
        answerIndex: 0,
      },
    },
    random
  );
}

export function createFillBlankQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[],
  random: Random,
  chooseFrom: boolean
): Question {
  const exampleIndex = getRandomIndex(
    word.definitions[definitionIndex].examples,
    random
  );

  return shuffleChoices(
    {
      type: "fill-blank",
      word: word.german,
      definitionIndex,
      exampleIndex,
      chooseFrom: chooseFrom
        ? {
            choices: [
              word,
              ...shuffle(
                words.filter(
                  (w) => w !== word && w.partOfSpeech === word.partOfSpeech
                ),
                random
              ).slice(0, 4),
            ].map((w) => w.german),
            answerIndex: 0,
          }
        : null,
      chunks: createChunks(
        word.definitions[definitionIndex].examples[exampleIndex]
      ),
    },
    random
  );
}

export function createTranslateFromQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[],
  random: Random,
  chooseFrom: boolean
): Question {
  const englishIndex = getRandomIndex(
    word.definitions[definitionIndex].english,
    random
  );

  return shuffleChoices(
    {
      type: "translate-from",
      word: word.german,
      definitionIndex,
      englishIndex,
      chooseFrom: chooseFrom
        ? {
            choices: [
              word,
              ...shuffle(
                words.filter(
                  (w) => w !== word && w.partOfSpeech === word.partOfSpeech
                ),
                random
              ).slice(0, 4),
            ].map((w) => w.german),
            answerIndex: 0,
          }
        : null,
    },
    random
  );
}

export function createTranslateToQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[],
  random: Random
): Question {
  const englishIndex = getRandomIndex(
    word.definitions[definitionIndex].english,
    random
  );

  return shuffleChoices(
    {
      type: "translate-to",
      word: word.german,
      definitionIndex,
      chooseFrom: {
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
            ),
            random
          ).slice(0, 4),
        ],
        answerIndex: 0,
      },
    },
    random
  );
}

export function createPhotoQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[],
  random: Random,
  chooseFrom: boolean
): Question {
  const photoIndex = getRandomIndex(
    word.definitions[definitionIndex].photos ?? [],
    random
  );

  return shuffleChoices(
    {
      type: "photo",
      word: word.german,
      definitionIndex,
      photoIndex,
      chooseFrom: chooseFrom
        ? {
            choices: [
              word.german,
              ...shuffle(
                words.flatMap((w) =>
                  w === word || w.partOfSpeech !== word.partOfSpeech
                    ? []
                    : [w.german]
                ),
                random
              ).slice(0, 4),
            ],
            answerIndex: 0,
          }
        : null,
    },
    random
  );
}

export function createRelatedWordQuestion(
  word: Word,
  definitionIndex: number,
  words: Word[],
  random: Random,
  relationType: "synonym" | "antonym" | "generic-term" | "sub-term"
): Question {
  const key = keyMapping[relationType];
  const def = word.definitions[definitionIndex];
  const index = getRandomIndex(def[key] ?? [], random);
  const relatedWord = def[key]?.[index];
  const relatedWords = words.flatMap((w) => {
    return w.partOfSpeech === word.partOfSpeech &&
      w.definitions.every((d) => !(d[key]?.includes(word.german) ?? false))
      ? [w.german]
      : [];
  });

  if (relatedWord === undefined) {
    throw Error();
  }

  return shuffleChoices(
    {
      type: relationType,
      word: word.german,
      definitionIndex,
      chooseFrom: {
        choices: [relatedWord, ...shuffle(relatedWords, random).slice(0, 4)],
        answerIndex: 0,
      },
    },
    random
  );
}

export function isAvailable(
  word: Word,
  definitionIndex: number,
  t: Question["type"]
): boolean {
  const def = word.definitions[definitionIndex];

  return !(
    (t === "generic-term" && (def.genericTerms ?? []).length === 0) ||
    (t === "sub-term" && (def.subTerms ?? []).length === 0) ||
    (t === "antonym" && (def.antonyms ?? []).length === 0) ||
    (t === "synonym" && (def.synonyms ?? []).length === 0) ||
    (t === "photo" && (def.photos ?? []).length === 0) ||
    (t === "fill-blank" && def.examples.length === 0) ||
    ((t === "translate-from" || t === "translate-to") &&
      def.english.length === 0)
  );
}
