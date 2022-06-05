import { Dispatch, useCallback, useMemo, useRef } from "react";
import { AiOutlineLoading3Quarters, AiOutlineClose } from "react-icons/ai";
import { Action } from "../models/State";
import { Word as WordModel } from "../models/Word";
import Button from "./Button";
import Word from "./Word";

export function Search({
  words,
  dispatch,
  detailExpand,
  keyword,
  adding,
}: {
  words: WordModel[];
  detailExpand?: string;
  keyword: string;
  adding: boolean;
  dispatch: Dispatch<Action>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const matchedWords = useMemo(() => {
    if (keyword === "") {
      return [];
    }

    const lowerKeyword = keyword.toLocaleLowerCase();

    return words
      .filter((w) => w.german.toLocaleLowerCase().includes(lowerKeyword))
      .slice(0, 100);
  }, [keyword, words]);
  const handleConfigureWord = useCallback(
    (word: WordModel) => dispatch({ type: "configure-word", payload: word }),
    [dispatch]
  );

  return (
    <div className="flex flex-col items-stretch overflow-hidden">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          disabled={adding}
          className="outline-none p-2 text-xl bg-gray-100 dark:bg-gray-800 w-full rounded-lg flex-grow-0 flex-shrink-0 disabled:opacity-50 dark:placeholder:text-gray-600"
          placeholder="📕 Type German word"
          autoFocus={true}
          onChange={(e) =>
            dispatch({ type: "search", payload: e.target.value })
          }
        />
        {keyword.length > 0 && (
          <button
            className="absolute right-0 h-full px-2"
            onClick={() => {
              dispatch({ type: "search", payload: "" });
              inputRef.current?.focus();
            }}
          >
            <span className="sr-only">Close</span>
            <AiOutlineClose />
          </button>
        )}
      </div>
      {matchedWords.length > 0 ? (
        <ul className="flex flex-col items-stretch py-4 flex-grow flex-shrink">
          {matchedWords.map((w) => (
            <li key={w.german}>
              {w.german === detailExpand ? (
                <Word
                  className="my-2"
                  word={w}
                  onConfigure={handleConfigureWord}
                />
              ) : (
                <button
                  className="p-2 w-full transition-colors flex flex-col md:flex-row items-start gap-0 md:gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  type="button"
                  onClick={() =>
                    dispatch({ type: "toggle-detail", payload: w.german })
                  }
                >
                  <div className="w-auto md:w-32 flex-grow-0 flex-shrink-0 font-semibold">
                    {w.german}
                  </div>
                  <div className="text-left text-gray-500 text-sm line-clamp-2 flex-grow flex-shrink">
                    {w.definitions.map((d) => d.definition).join("; ")}
                  </div>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : keyword === "" ? null : (
        <div className="flex flex-col gap-2 items-center">
          <p className="text-gray-500 py-8">Nothing matched</p>
        </div>
      )}
      {keyword === "" ||
      matchedWords.some((w) => w.german === keyword) ? null : (
        <Button
          color={matchedWords.length === 0 ? "blue" : "gray"}
          className="break-all relative truncate mx-auto max-w-full"
          disabled={adding}
          onClick={() => dispatch({ type: "add" })}
        >
          {adding && (
            <AiOutlineLoading3Quarters className="align-text-bottom inline mr-2 w-5 h-5 animate-spin" />
          )}
          {adding ? "Adding" : "Add"} &quot;<i>{keyword}</i>&quot; to dictionary
          {adding ? "..." : ""}
        </Button>
      )}
    </div>
  );
}
