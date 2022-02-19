import { ReactNode } from "react";
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
  showExplanation: boolean;
  onResponse: (response: number) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl py-6">{question}</h2>
      <ol
        className={`gap-2 ${
          layout === "grid" ? "grid grid-cols-2" : "flex flex-col items-stretch"
        }`}
      >
        {choices.map((c, index) => {
          const isMiss = missedResponses.includes(index);
          const isHit = done && answerIndex === index;

          return (
            <li key={index}>
              <button
                className={`${
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
                  {isMiss ? "×" : isHit ? "️✓︎" : index + 1}
                </div>
                {c}
              </button>
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
