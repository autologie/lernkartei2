export interface Word {
  german: string;
  definitions: WordMeaning[];
}

export interface WordMeaning {
  definition: string;
  english: string[];
  examples: string[];
}
