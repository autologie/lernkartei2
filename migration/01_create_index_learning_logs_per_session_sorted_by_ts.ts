import { getClient } from "../fauna";
import q from "faunadb";
(async () => {
  await getClient().query(
    q.CreateIndex({
      name: "learning_logs_per_session_sorted_by_ts",
      source: q.Collection("LearningLog"),
      terms: [{ field: ["data", "sessionId"] }],
      values: [{ field: ["ts"] }, { field: ["ref"] }],
    })
  );
})();
