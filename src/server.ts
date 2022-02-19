import express from "express";
import cors from "cors";
import { loadWords, fetchFromWiktionary, addWord } from "./dictionary";
import path from "path";

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.static(path.join(__dirname, "../build")));

app.get("/api/words", (req, res) => {
  res.json(loadWords());
});

app.get("/api/words/:word", async (req, res) => {
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
