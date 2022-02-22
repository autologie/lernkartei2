import { NextApiRequest, NextApiResponse } from "next";
import { addLearningLog } from "../../fauna";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(404).end();
  }

  await addLearningLog(req.body);

  res.status(204).end();
}
