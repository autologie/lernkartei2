import express from "express";
import cors from "cors";
import { loadWords, fetchFromWiktionary, addWord } from "./dictionary";

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());

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

  addWord(word);
  res.json(word);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
