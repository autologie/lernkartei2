import { useReducer } from "react";
import { Word as WordModel } from "../models/Word";
import ExampleText from "./ExampleText";

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
}: {
  word: WordModel;
  className?: string;
  highlightedIndex?: number;
}) {
  const [openIndex, dispatch] = useReducer(applyState, highlightedIndex);

  return (
    <div className={`bg-blue-100 rounded-lg py-4 ${className ?? ""}`}>
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
                : "cursor-pointer hover:bg-opacity-50"
            }`}
            onClick={openIndex === i ? undefined : () => dispatch(i)}
          >
            <span className="flex-shrink-0 text-center block text-xs text-black text-opacity-70 bg-blue-200 rounded-lg py-1 w-6">
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
                            <ExampleText mode="italic">{e}</ExampleText>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {def.english.length > 0 && (
                    <>
                      <h4 className="my-2 text-gray-500 uppercase text-sm font-semibold">
                        In English
                      </h4>
                      {def.english.join(", ")}
                    </>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="px-4 mt-3 text-opacity-70 text-black text-sm">
        Source:{" "}
        <a
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://de.wiktionary.org/wiki/${encodeURIComponent(
            word.german
          )}`}
        >
          Wiktionary
        </a>
      </p>
    </div>
  );
}
