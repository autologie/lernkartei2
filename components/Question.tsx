/* eslint-disable @next/next/no-img-element */
import { Question as Model } from "../models/Question";
import { Word } from "../models/Word";
import ExampleText from "./ExampleText";
import QuestionTemplate from "./QuestionTemplate";
import WiktionaryLink from "./WiktionaryLink";

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
  missResponses: number[];
  showExplanation: boolean;
  hintUsed: boolean;
  isNewer: boolean;
  onResponse: (responses: number) => void;
  onConfigureWord: (word: Word) => void;
  onRequestHint: () => void;
}) {
  const commonProps = {
    isNewer,
    word,
    missResponses,
    done,
    answerIndex: question.answerIndex,
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
          choices={question.choices.map((c, i) =>
            c.definition.replace(word.german, "———")
          )}
        />
      );
    case "translate-from":
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
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
          choices={question.choices.map((c) => c.english)}
        />
      );
    case "fill-blank":
      return (
        <QuestionTemplate
          {...commonProps}
          layout="grid"
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
                Text Source: <WiktionaryLink entry={question.word} />
                {hintUsed ? (
                  <>
                    {" "}
                    • Hint:{" "}
                    {word.definitions[question.definitionIndex].definition}
                  </>
                ) : done ? null : (
                  <>
                    {" "}
                    •{" "}
                    <button className="underline" onClick={onRequestHint}>
                      Show hint
                    </button>
                  </>
                )}
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
          layout="grid"
          question={
            <>
              Welches Wort passt zum Bild an?
              <img
                src={photo.url}
                alt={photo.caption}
                className="block w-full mt-4 object-contain bg-gray-100 rounded"
                style={{ maxHeight: "50vh" }}
              />
              <p className="my-1 text-center text-gray-500 text-base">
                Image source: <WiktionaryLink entry={question.word} />
              </p>
            </>
          }
          choices={question.choices}
        />
      );
  }
}
