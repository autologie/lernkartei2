import fetch from "node-fetch";
import jsdom, { JSDOM } from "jsdom";
import { Photo, WordData } from "./models/Word";

function findIndices(text: string | null): number[] {
  return (text ?? "").split(/[\[,\]]/).flatMap((segment) => {
    const n = Number.parseInt(segment.trim(), 10);
    console.log("---", segment, n);

    return Number.isNaN(n) ? [] : [n];
  });
}

function extractEnglish(dom: JSDOM): Map<number, string[]> {
  return (
    dom.window.document.querySelector("[title='Englisch']")?.parentNode
      ?.textContent ?? ""
  )
    .split("[")
    .slice(1)
    .map((segment) => segment.split("]"))
    .reduce<Map<number, string[]>>((passed, [num, words]) => {
      findIndices(num).forEach((index) => {
        passed.set(
          index,
          (passed.get(index) ?? []).concat(
            words
              .split(/[,;]/)
              .map((w) => w.split(/→\s*/)[0].trim())
              .filter((w) => w !== "")
          )
        );
      });

      return passed;
    }, new Map());
}

function extractExamples(dom: JSDOM): Map<number, string[]> {
  return [
    ...(dom.window.document
      .querySelector("[title='Verwendungsbeispielsätze'] ~ dl")
      ?.querySelectorAll("dd") ?? []),
  ].reduce((passed, e) => {
    const indices = findIndices(e.textContent);
    console.log(indices, e.textContent);

    indices.forEach((index) => {
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
    });
    return passed;
  }, new Map<number, string[]>());
}

function extractPhotos(dom: JSDOM): Map<number, Photo[]> {
  return [...dom.window.document.querySelectorAll(".thumb")].reduce(
    (passed, el) => {
      const img = el.querySelector("img");
      const captionEl = el.querySelector(".thumbcaption");

      if (img !== null && captionEl !== null) {
        const indices = findIndices(captionEl.textContent ?? "");

        indices.forEach((index) => {
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
        });
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
    const indices = findIndices(el.textContent);

    if (indices.length > 0) {
      passed.set(
        indices[0],
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
