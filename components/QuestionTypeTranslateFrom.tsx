import { useState } from "react";
import { TranslateFrom } from "../models/Question";
import { Response } from "../models/Response";
import { Word } from "../models/Word";
import WordGuessInput from "./WordGuessInput";

export default function QuestionTypeTranslateFrom({
  done,
  question,
  word,
  missResponses,
  onResponse,
}: {
  done: boolean;
  question: TranslateFrom;
  missResponses: Response[];
  word: Word;
  onResponse: (res: Response) => void;
}) {
  const [res, setRes] = useState("");
  const eng =
    word.definitions[question.definitionIndex].english[question.englishIndex];

  if (question.chooseFrom === null) {
    return (
      <form
        className="leading-relaxed"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onResponse({ type: "input", value: [res] });
        }}
      >
        Das englische Wort <i className="font-semibold">{eng}</i> heißt{" "}
        <WordGuessInput
          value={res}
          className="inline mx-2"
          answer={question.word}
          missResponses={missResponses}
          done={done}
          onChange={setRes}
        />
        auf Deutsch.
      </form>
    );
  }

  return (
    <>
      Wie heißt das englische Wort <i className="font-semibold">{eng}</i> auf
      Deutsch?
    </>
  );
}
