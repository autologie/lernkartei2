import { Dispatch, useCallback, useEffect, useState } from "react";
import Confetti from "react-confetti";
import useRefreshWord from "../hooks/useRefreshWord";
import useRemoveWord from "../hooks/useRemoveWord";
import { Action, State } from "../models/State";
import { Word as WordModel } from "../models/Word";
import Button from "./Button";
import Explanation from "./Explanation";
import ModalTemplate from "./ModalTemplate";
import QrCode from "./QrCode";
import { Search } from "./Search";
import Word from "./Word";

export default function Modal({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) {
  const modal = state.modal;
  const [size, setSize] = useState<{ width: number; height: number }>();
  const handleRefresh = useRefreshWord(
    dispatch,
    modal?.type === "word" ? modal.word : undefined
  );
  const handleRemove = useRemoveWord(
    dispatch,
    modal?.type === "word" ? modal.word : undefined
  );
  const handleCloseModal = useCallback(
    () => dispatch({ type: "close-modal" }),
    [dispatch]
  );
  const handleConfigure = useCallback(
    (word: WordModel) => dispatch({ type: "configure-word", payload: word }),
    [dispatch]
  );
  const handleRef = useCallback(
    (e: HTMLDivElement) =>
      setSize((v) =>
        v === undefined
          ? {
              width: e?.offsetWidth ?? 0,
              height: e?.offsetHeight ?? 0,
            }
          : v
      ),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.document.body.style.overflow =
      modal === undefined ? "auto" : "hidden";
  }, [modal]);

  if (modal === undefined) {
    return <></>;
  }

  return (
    <ModalTemplate ref={handleRef} onClose={handleCloseModal}>
      {modal.type === "word" && (
        <>
          {modal.message !== undefined && (
            <h2 className="text-center text-xl font-semibold mb-4">
              {modal.message}
            </h2>
          )}
          <Word
            word={modal.word}
            hideEdit={modal.configure}
            onConfigure={handleConfigure}
          />
          {modal.configure && (
            <div className="mt-4 flex flex-col items-stretch gap-2">
              <Button fixedWidth={true} color="gray" onClick={handleRefresh}>
                Refresh dictionary
              </Button>
              <Button fixedWidth={true} color="gray" onClick={handleRemove}>
                Remove from dictionary
              </Button>
            </div>
          )}
        </>
      )}
      {modal.type === "explain-choice" && (
        <Explanation
          question={modal.item.question}
          choiceIndex={modal.choiceIndex}
          words={state.words}
          onConfigure={handleConfigure}
        />
      )}
      {modal.type === "search" && (
        <Search
          words={state.words}
          dispatch={dispatch}
          keyword={modal.word}
          detailExpand={modal.detailExpand}
        />
      )}
      {modal.type === "qr-code" && (
        <div className="flex flex-col items-center py-4">
          <p className="text-center w-4/5 md:w-2/3">
            Scan QR code or{" "}
            <button
              className="underline"
              onClick={() => {
                const url = `${window.location.origin}/${state.sessionId}`;

                window.navigator.clipboard.writeText(url).then(() => {
                  window.alert("Copied!");
                });
              }}
            >
              copy URL
            </button>{" "}
            to continue learning on different devices
          </p>
          <QrCode data={`${window.location.origin}/${state.sessionId}`} />
          <h2 className="text-gray-500 font-light">
            Session ID: {state.sessionId}
          </h2>
        </div>
      )}
      {modal.type === "mastered" && (
        <>
          {size !== undefined && <Confetti {...size} />}
          <h1 className="text-2xl font-semibold text-center">
            Congratulations!
          </h1>
          <p className="mt-2 mb-4 text-center">You have mastered a new word.</p>

          <div className="bg-blue-100 rounded-lg p-4">
            <h3 className="mb-3 text-xl font-semibold">
              {modal.word.german}{" "}
              <i className="text-base">({modal.word.partOfSpeech})</i>
            </h3>
            <p>{modal.word.definitions[modal.definitionIndex].definition}</p>
          </div>

          <Button
            className="mx-auto mt-4"
            color="blue"
            onClick={() => dispatch({ type: "next" })}
          >
            Continue Learning
          </Button>
        </>
      )}
    </ModalTemplate>
  );
}
