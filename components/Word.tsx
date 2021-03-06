import { Fragment, useReducer } from "react";
import { Word as WordModel } from "../models/Word";
import ExampleText from "./ExampleText";
import { formatDistanceToNow } from "date-fns";
import WiktionaryLink from "./WiktionaryLink";
import { createChunks } from "../models/ExampleTextChunk";

function applyState(
  openIndex: number | undefined,
  index: number
): number | undefined {
  return index === openIndex ? undefined : index;
}

export default function Word({
  word,
  className,
  highlightedIndex,
  hideEdit = false,
  onConfigure,
}: {
  word: WordModel;
  hideEdit?: boolean;
  className?: string;
  highlightedIndex?: number;
  onConfigure: (word: WordModel) => void;
}) {
  const [openIndex, dispatch] = useReducer(applyState, highlightedIndex);

  return (
    <div
      className={`relative bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg py-4 ${
        className ?? ""
      }`}
    >
      <h3 className="mb-3 text-xl font-semibold px-4">
        {word.german} <i className="text-base">({word.partOfSpeech})</i>
      </h3>
      <ul className="flex flex-col gap-3">
        {word.definitions.map((def, i) => (
          <li
            key={i}
            className={`transition-colors px-4 flex items-start gap-2 hover:bg-white hover:py-2 hover:-my-2 ${
              openIndex === i
                ? "hover:bg-opacity-0"
                : "cursor-pointer hover:bg-opacity-50 dark:hover:bg-opacity-10"
            }`}
            onClick={openIndex === i ? undefined : () => dispatch(i)}
          >
            <span className="flex-shrink-0 text-center block text-xs text-black text-opacity-70 dark:text-white dark:text-opacity-50 bg-blue-200 dark:bg-blue-800 dark:bg-opacity-50 rounded-lg py-1 w-6">
              {"abcdefghijklmnopqrstuvwxyz"[i]}
            </span>
            <div
              className={`flex-grow flex-shrink ${
                openIndex === i ? "" : "truncate"
              }`}
            >
              <span className={highlightedIndex === i ? "font-semibold" : ""}>
                {def.definition}
              </span>
              {openIndex === i && (
                <>
                  {def.examples.length > 0 && (
                    <>
                      <h4 className="my-2 text-gray-500 uppercase text-sm font-semibold">
                        Examples
                      </h4>
                      <ul className="ml-4 list-disc flex flex-col gap-1">
                        {def.examples.map((e, j) => (
                          <li key={j}>
                            <ExampleText mode="italic">
                              {createChunks(e)}
                            </ExampleText>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {[
                    { title: "In English", content: def.english.join(", ") },
                    { title: "Synonyms", content: def.synonyms?.join(", ") },
                    { title: "Antonyms", content: def.antonyms?.join(", ") },
                    {
                      title: "Generic Terms",
                      content: def.genericTerms?.join(", "),
                    },
                    { title: "Sub Terms", content: def.subTerms?.join(", ") },
                  ].map(({ title, content = "" }) => (
                    <Fragment key={title}>
                      {content !== "" && (
                        <>
                          <h4 className="my-2 text-gray-500 uppercase text-sm font-semibold">
                            {title}
                          </h4>
                          {content}
                        </>
                      )}
                    </Fragment>
                  ))}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="px-4 mt-4 text-gray-500 text-base text-right font-light">
        From <WiktionaryLink entry={word.german} /> ???{" "}
        {formatDistanceToNow(new Date(word._ts / 1000), { addSuffix: true })}
        {hideEdit ? (
          ""
        ) : (
          <>
            {" "}
            ???{" "}
            <button
              className="underline font-light"
              onClick={() => onConfigure(word)}
            >
              Edit
            </button>
          </>
        )}
      </p>
    </div>
  );
}
