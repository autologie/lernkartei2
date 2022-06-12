/* eslint-disable @next/next/no-img-element */
import { Question } from "../models/Question";
import { Response } from "../models/Response";
import { Word } from "../models/Word";
import WiktionaryLink from "./WiktionaryLink";
import WordGuessInput from "./WordGuessInput";

export default function PhotoQuestion({
  done,
  question,
  word,
  missResponses,
  onResponse,
}: {
  done: boolean;
  question: Question & { type: "photo" };
  missResponses: Response[];
  word: Word;
  onResponse: (res: Response) => void;
}) {
  const photo = (word.definitions[question.definitionIndex].photos ?? [])[
    question.definitionIndex
  ];

  return (
    <>
      Welches Wort beschreibt das Bild?
      <img
        src={photo.url}
        alt={photo.caption}
        className="block w-full mt-4 object-contain bg-gray-100 dark:bg-gray-800 rounded"
        style={{ maxHeight: "50vh" }}
      />
      <p className="my-1 text-center text-gray-500 text-base font-light">
        Image source: <WiktionaryLink entry={question.word} />
      </p>
      {question.chooseFrom === null && (
        <WordGuessInput
          answer={question.word}
          missResponses={missResponses}
          done={done}
          onSubmit={(guess) => onResponse({ type: "input", value: guess })}
        />
      )}
    </>
  );
}
