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
const words = fs
  .readFileSync(WORDS_FILE, "utf8")
  .split("\n")
  .flatMap<Word>((line) => {
    try {
      return [JSON.parse(line)];
    } catch (e) {
      return [];
    }
  });

console.log(`Loaded ${words.length} words from file`);

app.use(cors());

app.get("/words", (req, res) => {
  res.json(words);
});

app.get("/words/:word", async (req, res) => {
  if (words.some((word) => word.german === req.params.word)) {
    return res.status(400).end();
  }

  const wiktionaryRes = await fetch(
    `https://de.wiktionary.org/wiki/${req.params.word}`
  );

  if (wiktionaryRes.status !== 200) {
    return res.status(wiktionaryRes.status).end();
  }

  const wiktionaryBody = await wiktionaryRes.text();
  const dom = new jsdom.JSDOM(wiktionaryBody);
  const englishTranslations = dom.window.document
    .querySelector("[title='Englisch']")
    ?.parentNode?.querySelectorAll("[lang=en]");
  const examples = dom.window.document
    .querySelector("[title='Verwendungsbeispielsätze'] ~ dl")
    ?.querySelectorAll("dd");
  const definitions = dom.window.document
    .querySelector("[title='Sinn und Bezeichnetes (Semantik)'] ~ dl")
    ?.querySelectorAll("dd");
  const word: Word = {
    german: req.params.word,
    english:
      englishTranslations === undefined
        ? []
        : [...englishTranslations].map((e) => e.textContent ?? ""),
    examples:
      examples === undefined
        ? []
        : [...examples].map((e) =>
            [...e.childNodes]
              .map((e) =>
                e.nodeName === "I" ? `[[${e.textContent}]]` : e.textContent
              )
              .join(" ")
              .replace(/^\[\w+\]\s*/, "")
              .replace(/\[\d+\]$/, "")
          ),
    definitions:
      definitions === undefined
        ? []
        : [...definitions].map(
            (e) =>
              e.textContent?.replace(
                /^\[\d+\]\s*(Hilfsverb [\w]+(,|:)\s*)?/,
                ""
              ) ?? ""
          ),
    level: "A1",
  };

  if (
    word.english.length === 0 ||
    word.examples.length === 0 ||
    word.definitions.length === 0
  ) {
    console.log(word);
    return res.status(400).end();
  }

  fs.appendFileSync(WORDS_FILE, JSON.stringify(word) + "\n", {
    encoding: "utf8",
  });
  res.json(word);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
