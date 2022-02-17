import { Question as Model } from "../models/Question";
import ExampleText from "./ExampleText";
import QuestionTemplate from "./QuestionTemplate";

export default function Question({
  question,
  missedResponses,
  done,
  showExplanation,
  onResponse,
}: {
  question: Model;
  done: boolean;
  missedResponses: number[];
  showExplanation: boolean;
  onResponse: (responses: number) => void;
}) {
  const commonProps = {
    word: question.word,
    missedResponses,
    done,
    answerIndex: question.answerIndex,
    definitionIndex: question.definitionIndex,
    showExplanation,
    onResponse,
  };

  switch (question.type) {
    case "define":
      return (
        <QuestionTemplate
          {...commonProps}
          question={
            <>
              Was bedeutet{" "}
              <i className="font-semibold">{question.word.german}</i>?
            </>
          }
          choices={question.choices.map((c) =>
            c.replace(question.word.german, "———")
          )}
        />
      );
    case "translate-from":
      return (
        <QuestionTemplate
          {...commonProps}
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
        />
      );
    case "translate-to":
      return (
        <QuestionTemplate
          {...commonProps}
          question={
            <>
              Wie heißt <i className="font-semibold">{question.word.german}</i>{" "}
              auf Englisch?
            </>
          }
          choices={question.choices}
        />
      );
    case "fill-blank":
      return (
        <QuestionTemplate
          {...commonProps}
          question={
            <ExampleText mode={done ? "italic-green" : "mask"}>
              {
                question.word.definitions[question.definitionIndex].examples[
                  question.exampleIndex
                ]
              }
            </ExampleText>
          }
          choices={question.choices}
        />
      );
    default:
      return <div>TBD</div>;
  }
}
