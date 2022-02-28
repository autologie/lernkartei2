import { getClient } from "../fauna";
import q from "faunadb";
(async () => {
  await getClient().query(
    q.CreateCollection({
      name: "LearningProgressSnapshot",
    })
  );
})();
