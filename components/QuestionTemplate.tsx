import { ReactNode, useRef } from "react";
import Word from "./Word";
import { Word as WordModel } from "../models/Word";
import styles from "./QuestionTemplate.module.css";
import { Response } from "../models/Response";
import Button from "./Button";
import Choice from "./Choice";

export default function QuestionTemplate({
  question,
  chooseFrom,
  definitionIndex,
  missResponses,
  done,
  word,
  layout,
  showExplanation,
  isNewer,
  onResponse,
  onConfigureWord,
}: {
  question: ReactNode;
  layout: "grid" | "list";
  definitionIndex: number;
  chooseFrom: { choices: string[]; answerIndex: number } | null;
  missResponses: Response[];
  done: boolean;
  word: WordModel;
  isNewer: boolean;
  showExplanation: boolean;
  onResponse: (response: Response) => void;
  onConfigureWord: (word: WordModel) => void;
}) {
  const wasDone = useRef(done);

  return (
    <div
      className={`${
        isNewer ? styles.question_from_right : styles.question_from_left
      } flex flex-col`}
    >
      <h2 className="text-2xl pb-6">{question}</h2>
      <ol
        className={`gap-2 ${
          layout === "grid"
            ? "grid grid-col-1 md:grid-cols-2 place-items-stretch"
            : "flex flex-col items-stretch"
        }`}
      >
        {chooseFrom?.choices.map((c, index) => {
          const isMiss = missResponses.some(
            (miss) => miss.type === "choice" && miss.value === index
          );
          const isHit = done && chooseFrom.answerIndex === index;

          return (
            <Choice
              key={index}
              layout={layout}
              index={index}
              isHit={isHit}
              isMiss={isMiss}
              done={done}
              wasDone={wasDone.current}
              onResponse={onResponse}
            >
              {c}
            </Choice>
          );
        })}
      </ol>
      {!done && chooseFrom === null && (
        <Button
          className="w-full"
          color="gray"
          onClick={() => onResponse({ type: "give-up" })}
        >
          Give up
        </Button>
      )}
      {showExplanation && (
        <Word
          word={word}
          className="mt-4"
          highlightedIndex={definitionIndex}
          onConfigure={onConfigureWord}
        />
      )}
    </div>
  );
}
