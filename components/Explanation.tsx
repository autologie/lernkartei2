import { Question } from "../models/Question";
import { Word as WordModel } from "../models/Word";
import Word from "./Word";

export default function Explanation({
  question,
  choiceIndex,
  words,
  onConfigure,
}: {
  question: Question;
  choiceIndex: number;
  words: WordModel[];
  onConfigure: (word: WordModel) => void;
}) {
  const german: string =
    question.type === "define" || question.type === "translate-to"
      ? question.choices[choiceIndex].word
      : question.choices[choiceIndex];
  const word = words.find((w) => w.german === german);

  if (word === undefined) {
    return <></>;
  }

  switch (question.type) {
    case "translate-from":
    case "photo":
    case "fill-blank":
      return <Word word={word} onConfigure={onConfigure} />;
    case "translate-to":
      return (
        <>
          <p className="mb-4 text-lg text-gray-700 font-light">
            This word can be translated into{" "}
            <i className="font-semibold">{word.german}</i>:
          </p>
          <Word
            word={word}
            highlightedIndex={question.choices[choiceIndex].definitionIndex}
            onConfigure={onConfigure}
          />
        </>
      );
    case "define":
      return (
        <>
          <p className="mb-4 text-lg text-gray-700 font-light">
            This text describes <i className="font-semibold">{word.german}</i>:
          </p>
          <Word
            word={word}
            highlightedIndex={question.choices[choiceIndex].definitionIndex}
            onConfigure={onConfigure}
          />
        </>
      );
  }
}
