import { Dispatch, useCallback, useEffect } from "react";
import useRefreshWord from "../hooks/useRefreshWord";
import useRemoveWord from "../hooks/useRemoveWord";
import { Action, State } from "../models/State";
import { Word as WordModel } from "../models/Word";
import Button from "./Button";
import CloseButton from "./CloseButton";
import Explanation from "./Explanation";
import { ModalTemplate } from "./ModalTemplate";
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
  const handleRefresh = useRefreshWord(
    dispatch,
    modal?.type === "configure-word" ? modal.word : undefined
  );
  const handleRemove = useRemoveWord(
    dispatch,
    modal?.type === "configure-word" ? modal.word : undefined
  );
  const handleCloseModal = useCallback(
    () => dispatch({ type: "close-modal" }),
    [dispatch]
  );
  const handleConfigure = useCallback(
    (word: WordModel) => dispatch({ type: "configure-word", payload: word }),
    [dispatch]
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
    <ModalTemplate onClose={handleCloseModal}>
      {modal.type === "word" && (
        <>
          {modal.message !== undefined && (
            <h2 className="text-center text-xl font-semibold mb-4">
              Word added
            </h2>
          )}
          <Word
            word={modal.word}
            onConfigure={(word) =>
              dispatch({ type: "configure-word", payload: word })
            }
          />
        </>
      )}
      {modal.type === "configure-word" && (
        <>
          <h2 className="text-center text-xl font-semibold mb-4">
            Manage word{" "}
            <i className="font-semibold">&quot;{modal.word.german}&quot;</i>
          </h2>
          <div className="flex flex-col items-stretch gap-2">
            <Button fixedWidth={true} color="gray" onClick={handleRefresh}>
              Refresh dictionary
            </Button>
            <Button fixedWidth={true} color="gray" onClick={handleRemove}>
              Remove from dictionary
            </Button>
            <Button
              fixedWidth={true}
              color="gray"
              onClick={() => dispatch({ type: "close-modal" })}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
      {modal.type === "explain-choice" && (
        <>
          <Explanation
            question={modal.item.question}
            choiceIndex={modal.choiceIndex}
            words={state.words}
            onConfigure={handleConfigure}
          />
          <CloseButton
            className="absolute right-0 top-0 z-10 hidden md:flex -m-3"
            onClick={() => dispatch({ type: "close-modal" })}
          />
        </>
      )}
      {modal.type === "search" && (
        <Search words={state.words} dispatch={dispatch} keyword={modal.word} />
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
          <CloseButton
            className="absolute right-0 top-0 z-10 hidden md:flex -m-3"
            onClick={() => dispatch({ type: "close-modal" })}
          />
        </div>
      )}
    </ModalTemplate>
  );
}
