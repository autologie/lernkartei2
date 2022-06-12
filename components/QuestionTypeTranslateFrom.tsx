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
  const eng =
    word.definitions[question.definitionIndex].english[question.englishIndex];

  if (question.chooseFrom === null) {
    return (
      <div className="leading-relaxed">
        Das englische Wort <i className="font-semibold">{eng}</i> heißt{" "}
        <WordGuessInput
          className="inline mx-2"
          answer={question.word}
          missResponses={missResponses}
          done={done}
          onSubmit={(guess) => onResponse({ type: "input", value: guess })}
        />
        auf Deutsch.
      </div>
    );
  }

  return (
    <>
      Wie heißt das englische Wort <i className="font-semibold">{eng}</i> auf
      Deutsch?
    </>
  );
}
