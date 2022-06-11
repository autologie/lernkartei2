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
}): JSX.Element {
  const german: string =
    question.type === "define" || question.type === "translate-to"
      ? question.choices[choiceIndex].word
      : question.choices[choiceIndex];
  const word = words.find((w) => w.german === german);

  if (word === undefined) {
    return <></>;
  }

  switch (question.type) {
    case "synonym":
    case "antonym":
    case "generic-term":
    case "sub-term":
      const w = words.find((ww) => ww.german === question.choices[choiceIndex]);

      return w === undefined ? (
        <p className="text-center my-8">No explanation available.</p>
      ) : (
        <Word word={w} onConfigure={onConfigure} />
      );
    case "translate-from":
    case "photo":
    case "fill-blank":
      return <Word word={word} onConfigure={onConfigure} />;
    case "translate-to":
      return (
        <>
          <p className="mb-4 text-lg font-light">
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
          <p className="mb-4 text-lg font-light">
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
