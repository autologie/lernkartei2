/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useState } from "react";
import { Question as Model } from "../models/Question";
import { Word } from "../models/Word";
import ExampleText from "./ExampleText";
import QuestionTemplate from "./QuestionTemplate";

export default function Question({
  question,
  word,
  missResponses,
  done,
  showExplanation,
  isNewer,
  onResponse,
  onConfigureWord,
}: {
  question: Model;
  word: Word;
  done: boolean;
  missResponses: number[];
  showExplanation: boolean;
  isNewer: boolean;
  onResponse: (responses: number) => void;
  onConfigureWord: (word: Word) => void;
}) {
  const [showHint, setHint] = useState(false);
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
              {showHint || done ? (
                <p className="text-sm mt-2 text-gray-500 font-light">
                  Hint: {word.definitions[question.definitionIndex].definition}
                </p>
              ) : (
                <button
                  className="block text-sm mt-2 text-gray-500 font-light underline"
                  onClick={() => setHint(true)}
                >
                  Show hint
                </button>
              )}
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
                className="block mx-auto mt-4"
              />
            </>
          }
          choices={question.choices}
        />
      );
  }
}
