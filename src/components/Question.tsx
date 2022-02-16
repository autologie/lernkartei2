import { Question as Model } from "../models/Question";
import { mask } from "../models/String";
import QuestionTemplate from "./QuestionTemplate";

export default function Question({
  question,
  response,
  onResponse,
}: {
  question: Model;
  response?: number;
  onResponse: (response: number) => void;
}) {
  switch (question.type) {
    case "define":
      return (
        <QuestionTemplate
          question={
            <>
              Was bedeutet <i>{question.word.german}</i>?
            </>
          }
          choices={question.choices}
          response={response}
          isCorrect={response === question.answerIndex}
          onResponse={onResponse}
        />
      );
    case "translate-from":
      return (
        <QuestionTemplate
          question={
            <>
              Wie heißt <i>{question.word.english[question.englishIndex]}</i>{" "}
              auf Deutsch?
            </>
          }
          choices={question.choices}
          response={response}
          isCorrect={response === question.answerIndex}
          onResponse={onResponse}
        />
      );
    case "translate-to":
      return (
        <QuestionTemplate
          question={
            <>
              Wie heißt <i>{question.word.german}</i> auf Englisch?
            </>
          }
          choices={question.choices}
          response={response}
          isCorrect={response === question.answerIndex}
          onResponse={onResponse}
        />
      );
    case "fill-blank":
      return (
        <QuestionTemplate
          question={<>{mask(question.word.examples[question.exampleIndex])}</>}
          choices={question.choices}
          response={response}
          isCorrect={response === question.answerIndex}
          onResponse={onResponse}
        />
      );
    default:
      return <div>TBD</div>;
  }
}
