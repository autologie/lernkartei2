import { ParsedUrlQuery } from "querystring";
import { Word } from "./Word";

export interface Settings {
  size?: number;
  partOfSpeech?: string;
  wordFilter?: string;
  debug: boolean;
}

export function test(settings: Settings, word: Word): boolean {
  return (
    (settings.partOfSpeech === undefined ||
      word.partOfSpeech === settings.partOfSpeech) &&
    (settings.wordFilter === undefined ||
      word.german.includes(settings.wordFilter))
  );
}

export function encode({
  size,
  partOfSpeech,
  wordFilter,
  debug,
}: Settings): string {
  const params = new URLSearchParams();

  if (size !== undefined) {
    params.set("size", String(size));
  }

  if (partOfSpeech) {
    params.set("partOfSpeech", partOfSpeech);
  }

  if (wordFilter) {
    params.set("filter", wordFilter);
  }

  if (debug) {
    params.set("debug", "true");
  }

  return params.toString();
}

export function decode(query: ParsedUrlQuery): Settings {
  const size = query?.["size"];
  const partOfSpeech = query?.["partOfSpeech"];
  const filter = query?.["filter"];
  const debug = query?.["debug"];

  return {
    ...(size === undefined || Array.isArray(size)
      ? undefined
      : { size: Number.parseInt(size, 10) }),
    ...(partOfSpeech === undefined || Array.isArray(partOfSpeech)
      ? undefined
      : { partOfSpeech }),
    ...(filter === undefined || Array.isArray(filter)
      ? undefined
      : { wordFilter: filter }),
    debug: debug !== undefined,
  };
}
