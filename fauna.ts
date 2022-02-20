import { Word } from "./models/Word";

async function request<T>(gql: string, variables: unknown): Promise<T> {
  return fetch("https://graphql.eu.fauna.com/graphql", {
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
  }).then((r) => r.json());
}

export async function addWord(word: Word) {
  await request<{
    data: { createWord: { _id: string } };
  }>(
    `mutation CreateWord($partOfSpeech: String!, $german: String!, $definitions: [WordMeaningInput]!) {
       createWord(data: { partOfSpeech: $partOfSpeech, german: $german, definitions: $definitions }) {
         _id
       }
     }`,
    word
  );
}

export async function loadWords(): Promise<Word[]> {
  const res = await request<{
    data: {
      words: {
        data: {
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
    `query {
       words {
         data {
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

  return res.data.words.data;
}
