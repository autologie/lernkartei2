import { useState } from "react";
import { FillBlank } from "../models/Question";
import { Response } from "../models/Response";
import { Word } from "../models/Word";
import ExampleText from "./ExampleText";
import WiktionaryLink from "./WiktionaryLink";
import WordGuessInput from "./WordGuessInput";

export default function QuestionTypeFillBlank({
  done,
  question,
  hintUsed,
  word,
  missResponses,
  onResponse,
  onRequestHint,
}: {
  done: boolean;
  hintUsed: boolean;
  question: FillBlank;
  missResponses: Response[];
  word: Word;
  onRequestHint: () => void;
  onResponse: (res: Response) => void;
}) {
  const [res, setRes] = useState({} as { [index: number]: string });

  return (
    <>
      <form
        className="leading-relaxed"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onResponse({
            type: "input",
            value: question.chunks.flatMap(({ isMatch }, i) =>
              isMatch ? [res[i] ?? ""] : []
            ),
          });
        }}
      >
        <ExampleText
          mode={
            question.chooseFrom === null
              ? "input"
              : done
              ? "italic-green"
              : "mask"
          }
          wordInput={(i) => (
            <WordGuessInput
              value={res[i] ?? ""}
              className="inline mx-2"
              answer={question.chunks[i].text ?? ""}
              missResponses={missResponses}
              done={done}
              placeholder={
                { Substantiv: "Sub.", Adjektiv: "Adj.", Adverb: "Adv." }[
                  word.partOfSpeech
                ] ?? word.partOfSpeech
              }
              onChange={(guess) =>
                setRes((current) => ({ ...current, [i]: guess }))
              }
            />
          )}
        >
          {question.chunks}
        </ExampleText>
      </form>
      <p className="text-base mt-2 text-gray-500 font-light">
        Text Source: <WiktionaryLink entry={question.word} />
        {hintUsed ? (
          <> • Hint: {word.definitions[question.definitionIndex].definition}</>
        ) : done ? null : (
          <>
            {" "}
            •{" "}
            <button className="underline font-light" onClick={onRequestHint}>
              Show hint
            </button>
          </>
        )}
      </p>
    </>
  );
}
