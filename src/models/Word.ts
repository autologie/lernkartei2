export interface Word {
  german: string;
  definitions: WordMeaning[];
}

export interface WordMeaning {
  definition: string;
  english: string[];
  examples: string[];
}

export function modify(word: Word): Word {
  return {
    ...word,
    definitions: word.definitions.filter(
      (d) => !d.definition.includes("veraltete Bedeutung") // exclude less relevant definition; maybe nice to include in a "hard mode"
    ),
  };
}
