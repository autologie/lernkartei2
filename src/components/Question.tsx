import { Question as Model } from "../models/Question";
import { Word } from "../models/Word";
import ExampleText from "./ExampleText";
import QuestionTemplate from "./QuestionTemplate";

export default function Question({
  question,
  word,
  missedResponses,
  done,
  showExplanation,
  onResponse,
}: {
  question: Model;
  word: Word;
  done: boolean;
  missedResponses: number[];
  showExplanation: boolean;
  onResponse: (responses: number) => void;
}) {
  const commonProps = {
    word,
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
              <p>
                Was bedeutet <i className="font-semibold">{word.german}</i>?
              </p>
              {question.definitionIndex > 0 && (
                <p className="text-base mt-2 text-gray-500">
                  Achtung: <i>{word.german}</i> ist mehrdeutig!
                </p>
              )}
            </>
          }
          choices={question.choices.map((c) => c.replace(word.german, "———"))}
        />
      );
    case "translate-from":
      return (
        <QuestionTemplate
          {...commonProps}
          question={
            <>
              Wie heißt das englische Wort{" "}
              <i className="font-semibold">
                {
                  word.definitions[question.definitionIndex].english[
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
              <p>
                Wie heißt <i className="font-semibold">{word.german}</i> auf
                Englisch?
              </p>
              {question.definitionIndex > 0 && (
                <p className="text-base mt-2 text-gray-500">
                  Achtung: <i>{word.german}</i> ist mehrdeutig!
                </p>
              )}
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
            <>
              <ExampleText mode={done ? "italic-green" : "mask"}>
                {
                  word.definitions[question.definitionIndex].examples[
                    question.exampleIndex
                  ]
                }
              </ExampleText>
              <p className="text-base mt-2 text-gray-500">
                Hinweiß: {word.definitions[question.definitionIndex].definition}
              </p>
            </>
          }
          choices={question.choices}
        />
      );
    case "photo":
      const photo = (word.definitions[question.definitionIndex].photos ?? [])[
        question.photoIndex
      ];

      return (
        <QuestionTemplate
          {...commonProps}
          question={
            <>
              Welche Wort passt zum Bild an?
              <img
                src={photo.url}
                alt={photo.caption}
                className="block mx-auto mt-4"
              />
            </>
          }
          choices={question.choices}
        />
      );
  }
}
