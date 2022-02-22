import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useCallback, useEffect, useReducer } from "react";
import AddButton from "../components/AddButton";
import Debugger from "../components/Debugger";
import NavButton from "../components/NavButton";
import Question from "../components/Question";
import Word from "../components/Word";
import useAddNewWord from "../hooks/useAddNewWord";
import useKeyEventListener from "../hooks/useKeyEventListener";
import useNextAutomatically from "../hooks/useNextAutomatically";
import { LearningProgress, restoreFromLogs } from "../models/LearningProgress";
import { Question as QuestionModel } from "../models/Question";
import { decode, encode, Settings } from "../models/Settings";
import { applyAction, getInitialState } from "../models/State";
import { createQuestion, createWeights } from "../models/Weights";
import { Word as WordModel } from "../models/Word";
import { listLearningLogs, listWords } from "../fauna";
import { usePrevious } from "../hooks/usePrevious";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { Modal } from "../components/Modal";
import Button from "../components/Button";
import useRefreshWord from "../hooks/useRefreshWord";
import useRemoveWord from "../hooks/useRemoveWord";
import useLogSync from "../hooks/useLogSync";

function noop() {}

interface IndexProps {
  settings: Settings;
  words: WordModel[];
  progress: LearningProgress;
  question: QuestionModel | null;
}

export default function Index(props: IndexProps) {
  const [state, dispatch] = useReducer(applyAction, props, getInitialState);
  const item =
    state.history.length === 0 ? undefined : state.history[state.historyCursor];
  const word = state.words.find((w) => w.german === item?.question.word);
  const handleResponse = useCallback(
    (chosen: number) => dispatch({ type: "respond", payload: chosen }),
    []
  );
  const handleConfigureWord = useCallback(
    (word: WordModel) => dispatch({ type: "configure-word", payload: word }),
    []
  );
  const handleAdd = useAddNewWord(dispatch, state.modal !== undefined);
  const prevHistoryCursor = usePrevious(state.historyCursor);
  const handleRefresh = useRefreshWord(
    dispatch,
    state.modal?.type === "configure-word" ? state.modal.word : undefined
  );
  const handleRemove = useRemoveWord(
    dispatch,
    state.modal?.type === "configure-word" ? state.modal.word : undefined
  );
  const handleCloseModal = useCallback(
    () => dispatch({ type: "close-modal" }),
    []
  );

  useNextAutomatically(500, state, dispatch);
  useKeyEventListener(state, dispatch, handleAdd);
  useSwipeNavigation(dispatch);
  useLogSync(state);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.document.body.style.overflow =
      state.modal === undefined ? "auto" : "hidden";
  }, [state.modal]);

  return (
    <div className="p-4 pb-24 max-w-prose mx-auto relative overflow-hidden md:overflow-visible">
      {state.words.length === 0 ? (
        <p className="text-center">
          <button className="text-blue-500 underline" onClick={handleAdd}>
            Add a few words
          </button>{" "}
          {state.settings.wordFilter === undefined ? (
            ""
          ) : (
            <>
              or{" "}
              <a
                className="text-blue-500 underline"
                href={`?${encode({
                  ...state.settings,
                  wordFilter: undefined,
                })}`}
              >
                clear filter
              </a>
            </>
          )}{" "}
          to get started!
        </p>
      ) : item === undefined ? (
        <p className="text-center">Loading...</p>
      ) : word === undefined ? (
        <div className="mt-4 flex items-center flex-col gap-4 p-4 bg-red-100 rounded-lg">
          <p className="text-2xl font-semibold text-red-700">Word not found</p>
          <button
            className="block mx-auto mt-4 bg-white rounded-xl py-2 px-24 text-xl"
            onClick={() => dispatch({ type: "skip" })}
          >
            Skip
          </button>
        </div>
      ) : (
        <div className="relative">
          <Question
            key={`${state.history.length}-${state.historyCursor}`}
            word={word}
            isNewer={
              state.historyCursor === 0 ||
              prevHistoryCursor > state.historyCursor
            }
            question={item.question}
            missedResponses={item.missResponses}
            showExplanation={
              state.historyCursor > 0 ||
              (state.done && item.missResponses.length > 0)
            }
            done={state.historyCursor > 0 || state.done}
            onResponse={!state.done ? handleResponse : noop}
            onConfigureWord={handleConfigureWord}
          />
          {state.history.length > 0 &&
            state.history.length > state.historyCursor + 1 && (
              <NavButton
                direction="prev"
                className="hidden md:block mt-20 absolute left-0 top-0 -ml-20"
                onClick={() => dispatch({ type: "back" })}
              />
            )}
          {state.historyCursor > 0 && (
            <NavButton
              direction="next"
              className="hidden md:block mt-20 absolute right-0 top-0 -mr-20"
              onClick={() => dispatch({ type: "next" })}
            />
          )}
        </div>
      )}
      {(item?.missResponses.length ?? 0) > 0 &&
        state.done &&
        state.historyCursor === 0 && (
          <div className="fixed left-0 bottom-0 w-full">
            <Button
              color="blue"
              standout={true}
              className="mx-auto my-4"
              onClick={() => dispatch({ type: "next" })}
            >
              Next
            </Button>
          </div>
        )}
      <AddButton
        className="fixed z-10 right-0 bottom-0 m-3 md:m-4"
        onClick={handleAdd}
      />
      {state.modal !== undefined && (
        <Modal onClose={handleCloseModal}>
          {state.modal.type === "word-added" && (
            <>
              <h2 className="text-center text-xl font-semibold mb-4">
                Word added
              </h2>
              <Word word={state.modal.word} />
              <Button
                color="gray"
                className="mx-auto mt-4"
                onClick={handleCloseModal}
              >
                OK
              </Button>
            </>
          )}
          {state.modal.type === "configure-word" && (
            <>
              <h2 className="text-center text-xl font-semibold mb-4">
                Manage word{" "}
                <i className="font-semibold">
                  &quot;{state.modal.word.german}&quot;
                </i>
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
        </Modal>
      )}
      {state.settings.debug && (
        <Debugger
          words={state.words ?? []}
          weights={state.weights}
          maxCount={20}
        />
      )}
    </div>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<IndexProps>> {
  const settings = decode(ctx.query);
  const [words, logs] = await Promise.all([
    listWords(settings),
    listLearningLogs(),
  ]);
  const progress = restoreFromLogs(logs);

  return {
    props: {
      settings,
      words,
      progress: progress,
      question: createQuestion(createWeights(words, progress), words) ?? null,
    },
  };
}
