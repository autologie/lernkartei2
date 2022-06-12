import { Question as Model } from "../models/Question";
import { Word } from "../models/Word";
import QuestionTemplate from "./QuestionTemplate";
import { Response } from "../models/Response";
import QuestionTypeFillBlank from "./QuestionTypeFillBlank";
import QuestionTypeTranslateFrom from "./QuestionTypeTranslateFrom";
import PhotoQuestion from "./QuestionTypePhoto";

export default function Question({
  question,
  word,
  missResponses,
  hintUsed,
  done,
  showExplanation,
  isNewer,
  onResponse,
  onConfigureWord,
  onRequestHint,
}: {
  question: Model;
  word: Word;
  done: boolean;
  missResponses: Response[];
  showExplanation: boolean;
  hintUsed: boolean;
  isNewer: boolean;
  onResponse: (responses: Response) => void;
  onConfigureWord: (word: Word) => void;
  onRequestHint: () => void;
}): JSX.Element {
  const commonProps = {
    isNewer,
    word,
    missResponses,
    done,
    definitionIndex: question.definitionIndex,
    showExplanation,
    onResponse,
    onConfigureWord,
  };

  switch (question.type) {
    case "define":
      return (
        <QuestionTemplate
          {...commonProps}
          layout="list"
          question={
            <>
              <p>
                Was bedeutet <i className="font-semibold">{word.german}</i>?
              </p>
              {question.definitionIndex > 0 && (
                <p className="text-sm mt-2 text-gray-500 font-light">
                  Note: <i>{word.german}</i> has multiple meanings.
                </p>
              )}
            </>
          }
          chooseFrom={{
            ...question.chooseFrom,
            choices: question.chooseFrom.choices.map((c, i) =>
              c.definition.replace(word.german, "———")
            ),
          }}
        />
      );
    case "translate-from":
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
          question={
            <QuestionTypeTranslateFrom
              question={question}
              word={word}
              missResponses={missResponses}
              done={done}
              onResponse={onResponse}
            />
          }
          chooseFrom={question.chooseFrom}
        />
      );
    case "translate-to":
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
          question={
            <>
              <p>
                Wie heißt <i className="font-semibold">{word.german}</i> auf
                Englisch?
              </p>
              {question.definitionIndex > 0 && (
                <p className="text-sm mt-2 text-gray-500 font-light">
                  Note: <i>{word.german}</i> has multiple meanings.
                </p>
              )}
            </>
          }
          chooseFrom={{
            ...question.chooseFrom,
            choices: question.chooseFrom.choices.map((c) => c.english),
          }}
        />
      );
    case "fill-blank": {
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
          question={
            <QuestionTypeFillBlank
              question={question}
              word={word}
              hintUsed={hintUsed}
              missResponses={missResponses}
              done={done}
              onRequestHint={onRequestHint}
              onResponse={onResponse}
            />
          }
          chooseFrom={question.chooseFrom}
        />
      );
    }
    case "photo": {
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
          question={
            <PhotoQuestion
              question={question}
              word={word}
              done={done}
              missResponses={missResponses}
              onResponse={onResponse}
            />
          }
          chooseFrom={question.chooseFrom}
        />
      );
    }
    case "synonym":
    case "antonym":
    case "generic-term":
    case "sub-term":
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
          question={
            <>
              Welches Wort ist ein{" "}
              {
                {
                  synonym: "Synonym",
                  antonym: "Antonym",
                  "generic-term": "Oberbegriff",
                  "sub-term": "Unterbegriff",
                }[question.type]
              }{" "}
              für <i className="font-semibold">{question.word}</i>?
            </>
          }
          chooseFrom={question.chooseFrom}
        />
      );
  }
}
