import { getClient } from "../fauna";
import q from "faunadb";
(async () => {
  await getClient().query(
    q.CreateIndex({
      name: "learning_progress_snapshot_per_session",
      source: q.Collection("LearningProgressSnapshot"),
      terms: [{ field: ["data", "sessionId"] }],
      values: [{ field: ["ref"] }],
    })
  );
})();
