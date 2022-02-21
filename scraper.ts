import fetch from "node-fetch";
import jsdom, { JSDOM } from "jsdom";
import { Photo, WordData } from "./models/Word";

function findIndex(text: string | null): number {
  return Number.parseInt(text?.match(/^\[(\d+)\]/)?.[1] ?? "", 10) - 1;
}

function extractEnglish(dom: JSDOM): Map<number, string[]> {
  return (
    dom.window.document.querySelector("[title='Englisch']")?.parentNode
      ?.textContent ?? ""
  )
    .replace(/Englisch:\s*/, "")
    .split(/\s*[,;]\s*/)
    .map((t) => t.split(/\s*→\s*/)[0].split(/\s+/))
    .reduce<[number | undefined, Map<number, string[]>]>(
      ([currentIndex, passed], [num, ...phrase]) => {
        const found = findIndex(num);
        const index = Number.isNaN(found) ? currentIndex : found;

        if (index !== undefined && phrase.length > 0) {
          passed.set(
            index,
            (passed.get(index) ?? []).concat(
              [phrase.join(" ").replace(/\[\d+\]/g, "")].filter(
                (e) => e.trim() !== ""
              )
            )
          );
        }

        return [index, passed];
      },
      [undefined, new Map<number, string[]>()]
    )[1];
}

function extractExamples(dom: JSDOM): Map<number, string[]> {
  return [
    ...(dom.window.document
      .querySelector("[title='Verwendungsbeispielsätze'] ~ dl")
      ?.querySelectorAll("dd") ?? []),
  ].reduce((passed, e) => {
    const index = findIndex(e.textContent);

    passed.set(
      index,
      (passed.get(index) ?? []).concat(
        [
          [...e.childNodes]
            .map((n) =>
              n.nodeName === "I" ? `[[${n.textContent}]]` : n.textContent
            )
            .join("")
            .replace(/\[\d+\]/g, ""),
        ].filter((e) => e.trim() !== "")
      )
    );
    return passed;
  }, new Map<number, string[]>());
}

function extractPhotos(dom: JSDOM): Map<number, Photo[]> {
  return [...dom.window.document.querySelectorAll(".thumb")].reduce(
    (passed, el) => {
      const img = el.querySelector("img");
      const captionEl = el.querySelector(".thumbcaption");

      if (img !== null && captionEl !== null) {
        const index = findIndex(captionEl.textContent ?? "");

        passed.set(
          index,
          (passed.get(index) ?? []).concat([
            {
              url: img.src,
              caption: [...captionEl.childNodes]
                .map((n) =>
                  n.nodeName === "I" ? `[[${n.textContent}]]` : n.textContent
                )
                .join("")
                .replace(/\[\d+\]/g, ""),
            },
          ])
        );
      }

      return passed;
    },
    new Map<number, Photo[]>()
  );
}

function extractDefinitions(dom: JSDOM): Map<number, string> {
  return [
    ...(dom.window.document
      .querySelector("[title='Sinn und Bezeichnetes (Semantik)'] ~ dl")
      ?.querySelectorAll("dd") ?? []),
  ].reduce((passed, el) => {
    const index = findIndex(el.textContent);

    if (!Number.isNaN(index)) {
      passed.set(
        index,
        el.textContent
          ?.replace(/^\[\d+\]\s*(Hilfsverb [\w]+(,|:)\s*)?/, "")
          .replace(/\[\d+\]/g, "") ?? ""
      );
    }

    return passed;
  }, new Map<number, string>());
}

function extractPartOfSpeech(dom: JSDOM): string | undefined {
  return dom.window.document
    .querySelector("[title='Hilfe:Wortart']")
    ?.textContent?.trim();
}

function isGerman(dom: JSDOM): boolean {
  return (
    dom.window.document.querySelector("[title='Wiktionary:Deutsch']") !== null
  );
}

function extractWiktionaryContent(
  entry: string,
  html: string
): WordData | undefined {
  const dom = new jsdom.JSDOM(html);
  const partOfSpeech = extractPartOfSpeech(dom);
  const englishMap = extractEnglish(dom);
  const exampleMap = extractExamples(dom);
  const photosMap = extractPhotos(dom);
  const definitions = extractDefinitions(dom);

  if (!isGerman(dom) || partOfSpeech === undefined || definitions.size === 0) {
    return undefined;
  }

  const word: WordData = {
    partOfSpeech,
    german: entry,
    definitions: [...definitions].map(([index, definition]) => ({
      definition,
      examples: exampleMap.get(index) ?? [],
      english: englishMap.get(index) ?? [],
      photos: photosMap.get(index) ?? [],
    })),
  };

  return word;
}

export async function fetchFromWiktionary(
  word: string
): Promise<WordData | undefined> {
  const wiktionaryRes = await fetch(
    `https://de.wiktionary.org/wiki/${encodeURIComponent(word)}`
  );

  if (wiktionaryRes.status !== 200) {
    console.log(wiktionaryRes.status);
    return undefined;
  }

  const wiktionaryBody = await wiktionaryRes.text();

  return extractWiktionaryContent(word, wiktionaryBody);
}
