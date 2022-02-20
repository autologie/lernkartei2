import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useCallback, useMemo, useReducer } from "react";
import AddButton from "../src/components/AddButton";
import Debugger from "../src/components/Debugger";
import NavButton from "../src/components/NavButton";
import NextButton from "../src/components/NextButton";
import Question from "../src/components/Question";
import Word from "../src/components/Word";
import useAddNewWord from "../src/hooks/useAddNewWord";
import useKeyEventListener from "../src/hooks/useKeyEventListener";
import { useLearningProgressPersistence } from "../src/hooks/useLearningProgressPersistence";
import useNextAutomatically from "../src/hooks/useNextAutomatically";
import useNotifier from "../src/hooks/useNotifier";
import { LearningProgress } from "../src/models/LearningProgress";
import { Settings } from "../src/models/Settings";
import { applyAction, getInitialState } from "../src/models/State";
import { Word as WordModel } from "../src/models/Word";
import { loadWords } from "./api/words/[word]";

function noop() {}

interface IndexProps {
  settings: Settings;
  words: WordModel[];
  progress: LearningProgress;
}

export default function Index(props: IndexProps) {
  const [state, dispatch] = useReducer(applyAction, props, getInitialState);
  const historyToShow =
    state.historyCursor === undefined
      ? undefined
      : state.history[state.historyCursor];
  const word = useMemo(() => {
    const german =
      historyToShow === undefined
        ? state.question?.word
        : historyToShow?.question.word;

    return german === undefined
      ? undefined
      : state.words?.find((w) => w.german === german);
  }, [historyToShow, state.question, state.words]);
  const handleResponse = useCallback(
    (chosen: number) => dispatch({ type: "respond", payload: chosen }),
    []
  );
  const handleAdd = useAddNewWord(dispatch);

  useNextAutomatically(1000, state, dispatch);
  useKeyEventListener(state.question, dispatch, handleAdd);
  useNotifier(state);
  useLearningProgressPersistence(state.progress, dispatch);

  return (
    <div className="p-4 pb-24 max-w-prose mx-auto relative">
      {state.words?.length === 0 ? (
        <p>Add a few words to get started!</p>
      ) : state.question === undefined ? (
        <p>Loading...</p>
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
          {historyToShow === undefined ? (
            <Question
              key={state.question.word}
              word={word}
              question={state.question}
              missedResponses={state.missResponses}
              done={state.done}
              showExplanation={
                state.missResponses.length > 0 &&
                state.question !== undefined &&
                state.done
              }
              onResponse={handleResponse}
            />
          ) : (
            <Question
              key={historyToShow.question.word}
              word={word}
              question={historyToShow.question}
              missedResponses={historyToShow.missResponses}
              showExplanation={true}
              done={true}
              onResponse={noop}
            />
          )}
          {state.history.length > 0 &&
            (state.historyCursor === undefined ||
              state.history.length > state.historyCursor + 1) && (
              <NavButton
                direction="prev"
                className="mt-20 absolute left-0 top-0 -ml-20"
                onClick={() => dispatch({ type: "back" })}
              />
            )}
          {state.historyCursor !== undefined && (
            <NavButton
              direction="next"
              className="mt-20 absolute right-0 top-0 -mr-20"
              onClick={() => dispatch({ type: "next" })}
            />
          )}
        </div>
      )}
      {state.missResponses.length > 0 &&
        state.question !== undefined &&
        state.done &&
        state.historyCursor === undefined && (
          <div className="fixed left-0 bottom-0 m-4 w-full">
            <NextButton
              className="mx-auto mt-4"
              onClick={() => dispatch({ type: "next" })}
            />
          </div>
        )}
      <AddButton className="fixed right-0 bottom-0 m-4" onClick={handleAdd} />
      {state.modal?.type === "word-added" && (
        <div className="fixed left-0 top-0 w-full h-full flex flex-col items-center justify-start z-10 p-12 pt-36 overflow-auto">
          <div className="w-full max-w-prose p-4 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Word added</h2>
            <Word word={state.modal.word} />
            <button
              className="block mx-auto mt-4 transition-colors bg-gray-200 hover:bg-gray-300 rounded-xl py-2 px-24 text-base font-light"
              onClick={() => dispatch({ type: "close-modal" })}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {state.settings.debug && (
        <Debugger words={state.words ?? []} weights={state.weights} />
      )}
    </div>
  );
}

export async function getStaticProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<IndexProps>> {
  const size = ctx.params?.["size"];
  const partOfSpeech = ctx.params?.["partOfSpeech"];
  const filter = ctx.params?.["filter"];
  const debug = ctx.params?.["debug"];
  const settings = {
    ...(size === undefined || Array.isArray(size)
      ? undefined
      : { size: Number.parseInt(size, 10) }),
    ...(partOfSpeech === undefined || Array.isArray(partOfSpeech)
      ? undefined
      : { partOfSpeech }),
    ...(filter === undefined || Array.isArray(filter) ? undefined : { filter }),
    debug: debug !== undefined,
  };

  return {
    props: {
      settings,
      words: await loadWords(),
      progress: { tick: 0, table: {} },
    },
  };
}