import { Question as Model } from "../models/Question";
import { mask } from "../models/String";
import QuestionTemplate from "./QuestionTemplate";

export default function Question({
  question,
  missedResponses,
  done,
  onResponse,
}: {
  question: Model;
  done: boolean;
  missedResponses: number[];
  onResponse: (responses: number) => void;
}) {
  switch (question.type) {
    case "define":
      return (
        <QuestionTemplate
          question={
            <>
              Was bedeutet{" "}
              <i className="font-semibold">{question.word.german}</i>?
            </>
          }
          choices={question.choices.map((c) =>
            c.replace(question.word.german, "———")
          )}
          missedResponses={missedResponses}
          done={done}
          answerIndex={question.answerIndex}
          onResponse={onResponse}
        />
      );
    case "translate-from":
      return (
        <QuestionTemplate
          question={
            <>
              Wie heißt{" "}
              <i className="font-semibold">
                {
                  question.word.definitions[question.definitionIndex].english[
                    question.englishIndex
                  ]
                }
              </i>{" "}
              auf Deutsch?
            </>
          }
          choices={question.choices}
          missedResponses={missedResponses}
          done={done}
          answerIndex={question.answerIndex}
          onResponse={onResponse}
        />
      );
    case "translate-to":
      return (
        <QuestionTemplate
          question={
            <>
              Wie heißt <i className="font-semibold">{question.word.german}</i>{" "}
              auf Englisch?
            </>
          }
          choices={question.choices}
          missedResponses={missedResponses}
          done={done}
          answerIndex={question.answerIndex}
          onResponse={onResponse}
        />
      );
    case "fill-blank":
      return (
        <QuestionTemplate
          question={
            <>
              {mask(
                question.word.definitions[question.definitionIndex].examples[
                  question.exampleIndex
                ]
              )}
            </>
          }
          choices={question.choices}
          missedResponses={missedResponses}
          done={done}
          answerIndex={question.answerIndex}
          onResponse={onResponse}
        />
      );
    default:
      return <div>TBD</div>;
  }
}
