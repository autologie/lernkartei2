import { Question } from "../models/Question";
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
  question: Question & { type: "fill-blank" };
  missResponses: Response[];
  word: Word;
  onRequestHint: () => void;
  onResponse: (res: Response) => void;
}) {
  return (
    <>
      <div className="leading-relaxed">
        <ExampleText
          mode={
            question.chooseFrom === null
              ? "input"
              : done
              ? "italic-green"
              : "mask"
          }
          wordInput={
            <WordGuessInput
              className="inline mx-2"
              answer={question.word}
              missResponses={missResponses}
              done={done}
              onSubmit={(guess) => onResponse({ type: "input", value: guess })}
            />
          }
        >
          {
            word.definitions[question.definitionIndex].examples[
              question.exampleIndex
            ]
          }
        </ExampleText>
      </div>
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
