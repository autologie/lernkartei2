import { NextApiRequest, NextApiResponse } from "next";
import { deleteWord } from "../../../../fauna";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (Array.isArray(req.query.id) || req.method !== "DELETE") {
    return res.status(400).end();
  }

  await deleteWord(req.query.id);

  res.status(204).end();
}
