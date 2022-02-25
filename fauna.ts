import { LearningLog, LearningLogData } from "./models/LearningLog";
import { Question } from "./models/Question";
import { Settings } from "./models/Settings";
import { test } from "./models/Settings";
import { modify, Word, WordData } from "./models/Word";

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
  const res = await request<{
    data: {
      words: {
        data: {
          _id: string;
          _ts: number;
          german: string;
          partOfSpeech: string;
          definitions: {
            definition: string;
            english: string[];
            examples: [];
            photos: { url: string; caption: string }[];
          }[];
        }[];
      };
    };
  }>(
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
             }
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

export async function listLearningLogs(
  sessionId: string
): Promise<LearningLog[]> {
  const res = await request<{
    data: {
      learningLogs: {
        data: {
          _id: string;
          _ts: number;
          sessionId: string;
          word: string;
          definitionIndex: number;
          questionType: Question["type"];
          miss: boolean;
        }[];
      };
    };
  }>(
    // TODO: paginate properly
    `query($sessionId: String!) {
       learningLogs(_size: 1000, sessionId: $sessionId) {
         data {
           _id,
           _ts,
           sessionId,
           word,
           definitionIndex,
           questionType,
           miss
         }
       }
     }`,
    { sessionId }
  );

  return res.data.learningLogs.data;
}
