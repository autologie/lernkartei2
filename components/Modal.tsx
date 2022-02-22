import { Dispatch, useCallback, useEffect } from "react";
import useRefreshWord from "../hooks/useRefreshWord";
import useRemoveWord from "../hooks/useRemoveWord";
import { Action, State } from "../models/State";
import Button from "./Button";
import { ModalTemplate } from "./ModalTemplate";
import Word from "./Word";

export default function Modal({
  model,
  dispatch,
}: {
  model: State["modal"];
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
    </ModalTemplate>
  );
}
