import { Dispatch, useMemo } from "react";
import { Action } from "../models/State";
import { Word } from "../models/Word";

export function Search({
  words,
  dispatch,
  keyword,
}: {
  words: Word[];
  keyword: string;
  dispatch: Dispatch<Action>;
}) {
  const matchedWords = useMemo(() => {
    if (keyword === "") {
      return [];
    }

    return words.filter((w) => w.german.includes(keyword)).slice(0, 100);
  }, [keyword, words]);

  return (
    <div className="flex flex-col items-stretch overflow-hidden">
      <input
        type="text"
        className="outline-none p-2 text-xl bg-gray-100 w-full rounded-lg flex-grow-0 flex-shrink-0"
        placeholder="Search dictionary"
        autoFocus={true}
        onChange={(e) => dispatch({ type: "search", payload: e.target.value })}
      />
      {matchedWords.length > 0 ? (
        <ul className="flex flex-col items-stretch py-4 flex-grow flex-shrink">
          {matchedWords.map((w) => (
            <li key={w.german}>
              <button
                className="p-2 w-full transition-colors flex items-start gap-2 bg-transparent hover:bg-gray-100 rounded-lg"
                type="button"
                onClick={() => dispatch({ type: "view-word", payload: w })}
              >
                <div className="w-32 flex-grow-0 flex-shrink-0 font-semibold">
                  {w.german}
                </div>
                <div className="text-left text-gray-500 text-sm line-clamp-2 flex-grow flex-shrink">
                  {w.definitions.map((d) => d.definition).join("; ")}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : keyword === "" ? null : (
        <p className="italic text-gray-500 py-2">Nothing matched</p>
      )}
    </div>
  );
}
