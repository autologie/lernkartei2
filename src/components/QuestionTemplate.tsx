import { ReactNode } from "react";
import Word from "./Word";
import { Word as WordModel } from "../models/Word";

export default function QuestionTemplate({
  question,
  choices,
  answerIndex,
  definitionIndex,
  missedResponses,
  done,
  word,
  showExplanation,
  onResponse,
}: {
  question: ReactNode;
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
      <ol className="flex items-stretch flex-col gap-2">
        {choices.map((c, index) => {
          const isMiss = missedResponses.includes(index);
          const isHit = done && answerIndex === index;

          return (
            <li key={index}>
              <button
                className={`flex items-center w-full transition-colors text-xl rounded-xl py-2 px-4 text-left ${
                  isMiss
                    ? "bg-red-500 text-white"
                    : isHit
                    ? "bg-green-500 text-white"
                    : `bg-gray-200 ${done ? "" : "hover:bg-gray-300"}`
                }`}
                onClick={done ? undefined : () => onResponse(index)}
              >
                <div className="w-8 flex-grow-0 flex-shrink-0">
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
