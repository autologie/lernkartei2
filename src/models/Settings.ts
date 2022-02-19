import { Word } from "./Word";

export interface Settings {
  size?: number;
  partOfSpeech?: string;
  wordFilter?: string;
}

export function test(settings: Settings, word: Word): boolean {
  return (
    (settings.partOfSpeech === undefined ||
      word.partOfSpeech === settings.partOfSpeech) &&
    (settings.wordFilter === undefined ||
      word.german.includes(settings.wordFilter))
  );
}
