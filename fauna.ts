import { LearningLog, LearningLogData } from "./models/LearningLog";
import { Settings } from "./models/Settings";
import { test } from "./models/Settings";
import { modify, Word, WordData } from "./models/Word";
import q from "faunadb";
import { LearningProgress, restoreFromLogs } from "./models/LearningProgress";
import {
  decode,
  encode,
  LearningProgressSnapshotData,
} from "./models/LearningProgressSnapshot";
import { Fauna } from "./models/Fauna";

const COLLECTION_LEARNING_PROGRESS = q.Collection("LearningProgressSnapshot");
const INDEX_LEARNING_PROGRESS = q.Index(
  "learning_progress_snapshot_per_session"
);
const INDEX_LEARNING_LOGS_PER_SESSION_SORTED_BY_TS = q.Index(
  "learning_logs_per_session_sorted_by_ts"
);

export function getClient() {
  return new q.Client({
    secret: process.env.FAUNA_SECRET ?? "",
    domain: "db.us.fauna.com",
    scheme: "https",
  });
}

async function request<T>(gql: string, variables: unknown): Promise<T> {
  return fetch("https://graphql.us.fauna.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.FAUNA_SECRET ?? ""}`,
    },
    body: JSON.stringify({
      variables,
      query: gql,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.errors !== undefined) {
        console.error(data);
        throw Error("Fauna error response");
      }

      return data;
    });
}

export async function addWord(
  data: WordData
): Promise<{ _id: string; _ts: number }> {
  const res = await request<{
    data: { createWord: { _id: string; _ts: number } };
  }>(
    `mutation CreateWord($data: WordInput!) {
       createWord(data: $data) {
         _id,
         _ts
       }
     }`,
    { data }
  );

  return res.data.createWord;
}

export async function deleteWord(id: string) {
  await request<{
    data: { createWord: { _id: string } };
  }>(
    `mutation DeleteWord($id: ID!) {
       deleteWord(id: $id) {
         _id
       }
     }`,
    { id }
  );
}

export async function updateWord(
  id: string,
  word: WordData
): Promise<{ _id: string; _ts: number }> {
  const res = await request<{
    data: { updateWord: { _id: string; _ts: number } };
  }>(
    `mutation UpdateWord($id: ID!, $partOfSpeech: String!, $german: String!, $definitions: [WordMeaningInput]!) {
       updateWord(id: $id, data: { partOfSpeech: $partOfSpeech, german: $german, definitions: $definitions }) {
         _id,
         _ts
       }
     }`,
    { ...word, id }
  );

  return res.data.updateWord;
}

export async function listWords(settings: Settings): Promise<Word[]> {
  const res = await request<{ data: { words: { data: Word[] } } }>(
    // TODO: paginate properly
    `query {
       words(_size: ${settings.size ?? 1000}) {
         data {
           _id,
           _ts,
           german,
           partOfSpeech,
           definitions {
             definition,
             english,
             examples,
             photos {
               url,
               caption
             },
             synonyms,
             antonyms,
             genericTerms,
             subTerms
           }
         }
       }
     }`,
    {}
  );

  return res.data.words.data
    .map(modify)
    .filter((word) => test(settings, word))
    .sort((a, b) => a.german.localeCompare(b.german));
}

export async function addLearningLog(data: LearningLogData) {
  const res = await request<{
    data: { createLearningLog: { _id: string; _ts: number } };
  }>(
    `mutation CreateLearningLog($data: LearningLogInput!) {
       createLearningLog(data: $data) {
         _id,
         _ts
       }
     }`,
    { data }
  );

  return res.data.createLearningLog;
}

async function aggregateLearningProgress(
  sessionId: string
): Promise<
  [
    progress: LearningProgress,
    lastLogTimestamp: number | undefined,
    count: number
  ]
> {
  const [snapshot, logs] = await Promise.all([
    findSnapshot(sessionId),
    listLearningLogsAfterSnapshot(sessionId),
  ]);
  const progress = restoreFromLogs(logs, snapshot);

  if (logs.length > 0) {
    console.log(`Replayed ${logs.length} log(s) for sessionId ${sessionId}`);
  }

  return [
    progress,
    logs.length > 0 ? logs[logs.length - 1]._ts : undefined,
    logs.length,
  ];
}

async function listLearningLogsAfterSnapshot(
  sessionId: string
): Promise<LearningLog[]> {
  q.Ref;
  const res = await getClient().query<{
    data: { ts: number; ref: { id: string }; data: LearningLogData }[];
  }>(
    q.Let(
      {
        after: q.Let(
          {
            snapshots: q.Paginate(q.Match(INDEX_LEARNING_PROGRESS, sessionId)),
          },
          q.If(
            q.IsEmpty(q.Var("snapshots")),
            0,
            q.Add(
              q.Select(
                ["data", "lastLogTimestamp"],
                q.Get(q.Select(["data", 0], q.Var("snapshots")))
              ),
              1
            )
          )
        ),
      },
      q.Map(
        q.Paginate(
          q.Match(INDEX_LEARNING_LOGS_PER_SESSION_SORTED_BY_TS, sessionId),
          { after: q.Var("after"), size: 10000 }
        ),
        q.Lambda("log", q.Get(q.Select([1], q.Var("log"))))
      )
    )
  );

  return res.data.map(({ ts, ref, data }) => ({
    ...data,
    _ts: ts,
    _id: ref.id,
  }));
}

async function findSnapshot(
  sessionId: string
): Promise<Fauna<LearningProgress> | undefined> {
  const res = await getClient().query<
    | {
        ref: { id: string };
        ts: number;
        data: { data: string; sessionId: string; lastLogTimestamp: number };
      }
    | 0
  >(
    q.If(
      q.Exists(q.Match(INDEX_LEARNING_PROGRESS, sessionId)),
      q.Get(q.Match(INDEX_LEARNING_PROGRESS, sessionId)),
      0
    )
  );

  return res === 0
    ? undefined
    : { ...decode(res.data), _id: res.ref.id, _ts: res.ts };
}

async function upsertLearningProgressSnapshot(
  sessionId: string,
  snapshot: LearningProgressSnapshotData
) {
  await getClient().query(
    q.Let(
      {
        snapshots: q.Paginate(q.Match(INDEX_LEARNING_PROGRESS, sessionId)),
      },
      q.If(
        q.IsEmpty(q.Var("snapshots")),
        q.Create(COLLECTION_LEARNING_PROGRESS, { data: snapshot }),
        q.Let(
          { sessionId: q.Select(["data", 0, "id"], q.Var("snapshots")) },
          q.Update(q.Ref(COLLECTION_LEARNING_PROGRESS, q.Var("sessionId")), {
            data: snapshot,
          })
        )
      )
    )
  );
}

export async function getLearningProgress(
  sessionId: string
): Promise<LearningProgress> {
  const [progress, lastLogTimestamp, count] = await aggregateLearningProgress(
    sessionId
  );

  if (count >= 200) {
    await upsertLearningProgressSnapshot(
      sessionId,
      encode(sessionId, lastLogTimestamp ?? 0, progress)
    );
    console.log(`Snapshot created/updated for sessionId ${sessionId}`);
  }

  return progress;
}
