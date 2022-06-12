/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Photo } from "../models/Question";
import { Response } from "../models/Response";
import { Word } from "../models/Word";
import WiktionaryLink from "./WiktionaryLink";
import WordGuessInput from "./WordGuessInput";

export default function QuestionTypePhoto({
  done,
  question,
  word,
  missResponses,
  onResponse,
}: {
  done: boolean;
  question: Photo;
  missResponses: Response[];
  word: Word;
  onResponse: (res: Response) => void;
}) {
  const [res, setRes] = useState("");
  const photo = (word.definitions[question.definitionIndex].photos ?? [])[
    question.definitionIndex
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onResponse({ type: "input", value: [res] });
      }}
    >
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
        <div className="flex justify-center">
          <WordGuessInput
            className="mt-8"
            size="lg"
            value={res}
            answer={question.word}
            missResponses={missResponses}
            done={done}
            onChange={setRes}
          />
        </div>
      )}
    </form>
  );
}
