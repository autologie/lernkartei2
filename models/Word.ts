import { Fauna } from "./Fauna";

export interface WordData {
  partOfSpeech: string;
  german: string;
  definitions: WordMeaning[];
}

export type Word = Fauna<WordData>;

export interface Photo {
  url: string;
  caption: string;
}

export interface WordMeaning {
  definition: string;
  english: string[];
  examples: string[];
  photos?: Photo[];
}

export function modify(word: Word): Word {
  return {
    ...word,
    definitions: word.definitions.filter(
      (d) =>
        !d.definition.includes("selten:") &&
        !d.definition.includes("veraltet:") &&
        !d.definition.includes("veraltert:") &&
        !d.definition.includes("veraltend:") &&
        !d.definition.includes("veraltende Bedeutung:") &&
        !d.definition.includes("veraltete Bedeutung:") // exclude less relevant definition; maybe nice to include in a "hard mode"
    ),
  };
}
