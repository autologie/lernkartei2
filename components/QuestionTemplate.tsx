import { ReactNode, useRef } from "react";
import Word from "./Word";
import { Word as WordModel } from "../models/Word";
import styles from "./QuestionTemplate.module.css";

export default function QuestionTemplate({
  question,
  choices,
  answerIndex,
  definitionIndex,
  missedResponses,
  done,
  word,
  layout,
  showExplanation,
  isNewer,
  onResponse,
}: {
  question: ReactNode;
  layout: "grid" | "list";
  answerIndex: number;
  definitionIndex: number;
  choices: string[];
  missedResponses: number[];
  done: boolean;
  word: WordModel;
  isNewer: boolean;
  showExplanation: boolean;
  onResponse: (response: number) => void;
}) {
  const ChoiceElement = done ? "div" : "button"; // This way you can select text once the question is answered
  const wasDone = useRef(done);

  return (
    <div
      className={
        isNewer ? styles.question_from_right : styles.question_from_left
      }
    >
      <h2 className="text-2xl py-6">{question}</h2>
      <ol
        className={`gap-2 ${
          layout === "grid"
            ? "grid grid-col-1 md:grid-cols-2"
            : "flex flex-col items-stretch"
        }`}
      >
        {choices.map((c, index) => {
          const isMiss = missedResponses.includes(index);
          const isHit = done && answerIndex === index;

          return (
            <li key={index}>
              <ChoiceElement
                className={`relative ${
                  !done && isMiss ? styles.wrong_choice : ""
                } border-2 border-solid border-transparent flex items-center w-full transition-colors rounded-xl py-2 px-4 text-left ${
                  isMiss
                    ? "border-red-500 bg-gray-100"
                    : isHit
                    ? "bg-green-500 text-white"
                    : `bg-gray-100 ${done ? "" : "hover:bg-gray-200"}`
                } ${layout === "grid" ? "text-xl" : "text-base"}`}
                onClick={done ? undefined : () => onResponse(index)}
              >
                <div
                  className={`w-8 flex-grow-0 flex-shrink-0 font-semibold ${
                    isMiss
                      ? "text-red-500 text-2xl -mt-1"
                      : isHit
                      ? "text-xl"
                      : "text-gray-500 text-lg"
                  }`}
                >
                  {isHit && !wasDone.current && (
                    <div
                      className={`${styles.hit} absolute top-0 left-0 bg-green-500 rounded-2xl z-10`}
                    />
                  )}
                  {isMiss ? "×" : isHit ? "️✓︎" : index + 1}
                </div>
                {c}
              </ChoiceElement>
            </li>
          );
        })}
      </ol>
      {showExplanation && (
        <Word word={word} className="mt-4" highlightedIndex={definitionIndex} />
      )}
    </div>
  );
}
