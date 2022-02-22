import { Dispatch, useCallback, useEffect } from "react";
import useRefreshWord from "../hooks/useRefreshWord";
import useRemoveWord from "../hooks/useRemoveWord";
import { Action, State } from "../models/State";
import { Word as WordModel } from "../models/Word";
import Button from "./Button";
import CloseButton from "./CloseButton";
import Explanation from "./Explanation";
import { ModalTemplate } from "./ModalTemplate";
import Word from "./Word";

export default function Modal({
  model,
  words,
  dispatch,
}: {
  model: State["modal"];
  words: WordModel[];
  dispatch: Dispatch<Action>;
}) {
  const handleRefresh = useRefreshWord(
    dispatch,
    model?.type === "configure-word" ? model.word : undefined
  );
  const handleRemove = useRemoveWord(
    dispatch,
    model?.type === "configure-word" ? model.word : undefined
  );
  const handleCloseModal = useCallback(
    () => dispatch({ type: "close-modal" }),
    [dispatch]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.document.body.style.overflow =
      model === undefined ? "auto" : "hidden";
  }, [model]);

  if (model === undefined) {
    return <></>;
  }

  return (
    <ModalTemplate onClose={handleCloseModal}>
      {model.type === "word-added" && (
        <>
          <h2 className="text-center text-xl font-semibold mb-4">Word added</h2>
          <Word word={model.word} />
          <Button
            color="gray"
            className="mx-auto mt-4"
            onClick={handleCloseModal}
          >
            OK
          </Button>
        </>
      )}
      {model.type === "configure-word" && (
        <>
          <h2 className="text-center text-xl font-semibold mb-4">
            Manage word{" "}
            <i className="font-semibold">&quot;{model.word.german}&quot;</i>
          </h2>
          <div className="flex flex-col items-stretch gap-4">
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
      {model.type === "explain-choice" && (
        <>
          <Explanation
            question={model.item.question}
            choiceIndex={model.choiceIndex}
            words={words}
          />
          <CloseButton
            className="absolute right-0 top-0 z-10 invisible md:visible -m-3"
            onClick={() => dispatch({ type: "close-modal" })}
          />
          <Button
            className="mx-auto mt-4 md:hidden"
            color="gray"
            onClick={() => dispatch({ type: "close-modal" })}
          >
            Close
          </Button>
        </>
      )}
    </ModalTemplate>
  );
}
