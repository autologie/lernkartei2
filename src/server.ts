import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import jsdom from "jsdom";
import { Word } from "./models/Word";
import fs from "fs";
import path from "path";

const WORDS_FILE = path.join(__dirname, "../words.ndjson");
const app = express();
const port = 8080;

function findIndex(text: string | null): number {
  return Number.parseInt(text?.match(/^\[(\d+)\]/)?.[1] ?? "", 10) - 1;
}

function extractWiktionaryContent(
  entry: string,
  html: string
): Word | undefined {
  const dom = new jsdom.JSDOM(html);
  const partOfSpeech = dom.window.document
    .querySelector("[title='Hilfe:Wortart']")
    ?.textContent?.trim();
  const englishMap: Map<number, string[]> = (
    dom.window.document.querySelector("[title='Englisch']")?.parentNode
      ?.textContent ?? ""
  )
    .replace(/Englisch:\s*/, "")
    .split(/\s*;\s*/)
    .map((t) => t.split(/\s*→\s*/)[0].split(/\s+/))
    .reduce((passed, [num, ...phrase]) => {
      const index = findIndex(num);

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

      return passed;
    }, new Map<number, string[]>());
  const exampleMap: Map<number, string[]> = [
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

  if (partOfSpeech === undefined) {
    return undefined;
  }

  const word: Word = {
    partOfSpeech,
    german: entry,
    definitions: [
      ...(dom.window.document
        .querySelector("[title='Sinn und Bezeichnetes (Semantik)'] ~ dl")
        ?.querySelectorAll("dd") ?? []),
    ].flatMap((e) => {
      const index = findIndex(e.textContent);

      return Number.isNaN(index)
        ? []
        : [
            {
              definition:
                e.textContent
                  ?.replace(/^\[\d+\]\s*(Hilfsverb [\w]+(,|:)\s*)?/, "")
                  .replace(/\[\d+\]/g, "") ?? "",
              examples: exampleMap.get(index) ?? [],
              english: englishMap.get(index) ?? [],
            },
          ];
    }),
  };

  console.log(word);

  if (word.definitions.length === 0) {
    return undefined;
  }

  return word;
}

app.use(cors());

function loadWords(): Word[] {
  return fs
    .readFileSync(WORDS_FILE, "utf8")
    .split("\n")
    .flatMap<Word>((line) => {
      try {
        return [JSON.parse(line)];
      } catch (e) {
        return [];
      }
    });
}

async function fetchFromWiktionary(word: string): Promise<Word | undefined> {
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

app.get("/words", (req, res) => {
  res.json(loadWords());
});

app.get("/words/:word", async (req, res) => {
  if (loadWords().some((w) => w.german === req.params.word)) {
    return res.status(400).end();
  }

  const word = await fetchFromWiktionary(req.params.word);

  if (word === undefined) {
    return res.status(400).end();
  }

  fs.appendFileSync(WORDS_FILE, JSON.stringify(word) + "\n", "utf8");
  res.json(word);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
