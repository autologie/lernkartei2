import { NextApiRequest, NextApiResponse } from "next";
import { addWord } from "../../../../fauna";
import { Word } from "../../../../models/Word";
import { fetchFromWiktionary } from "../../../../scraper";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<Word>
) {
  if (Array.isArray(req.query.word) || req.method !== "POST") {
    return res.status(400).end();
  }

  const word = await fetchFromWiktionary(req.query.word);

  if (word === undefined) {
    return res.status(400).end();
  }

  const { _id, _ts } = await addWord(word);

  res.json({ ...word, _id, _ts });
}
