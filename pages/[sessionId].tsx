import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import dynamic from "next/dynamic";
import { useCallback, useReducer } from "react";
import AddButton from "../components/AddButton";
import Button from "../components/Button";
import NavButton from "../components/NavButton";
import NothingToShow from "../components/NothingToShow";
import Question from "../components/Question";
import SearchButton from "../components/SearchButton";
import WordNotFound from "../components/WordNotFound";
import { listLearningLogs, listWords } from "../fauna";
import useAddNewWord from "../hooks/useAddNewWord";
import useKeyEventListener from "../hooks/useKeyEventListener";
import useLogSync from "../hooks/useLogSync";
import useNextAutomatically from "../hooks/useNextAutomatically";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { restoreFromLogs } from "../models/LearningProgress";
import { decode } from "../models/Settings";
import {
  applyAction,
  getInitialState,
  InitialStateArgs,
  isNewerQuestion,
  shouldShowExplanation,
  shouldShowNavBackButton,
  shouldShowNavNextButton,
  shouldShowNextButton,
} from "../models/State";
import { createQuestion, createWeights } from "../models/Weights";
import { Word as WordModel } from "../models/Word";

const Modal = dynamic(() => import("../components/Modal"));
const Debugger = dynamic(() => import("../components/Debugger"));

export default function Session(props: InitialStateArgs) {
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
  const handleSearch = useCallback(
    () => dispatch({ type: "search", payload: "" }),
    []
  );

  useNextAutomatically(500, state, dispatch);
  useKeyEventListener(state, dispatch, handleAdd);
  useSwipeNavigation(dispatch);
  useLogSync(state);

  return (
    <div className="p-4 pb-24 max-w-prose mx-auto relative overflow-hidden md:overflow-visible">
      {state.words.length === 0 ? (
        <NothingToShow settings={state.settings} onAdd={handleAdd} />
      ) : item === undefined ? (
        <p className="text-center">Loading...</p>
      ) : word === undefined ? (
        <WordNotFound
          className="mt-4"
          onSkip={() => dispatch({ type: "skip" })}
        />
      ) : (
        <div className="relative">
          <button
            className="text-lg text-gray-500 font-light hover:underline"
            onClick={() => dispatch({ type: "show-qr-code" })}
          >
            #{state.progress.tick - state.historyCursor}
          </button>
          <Question
            key={`${state.history.length}-${state.historyCursor}`}
            word={word}
            isNewer={isNewerQuestion(state)}
            question={item.question}
            missResponses={item.missResponses}
            showExplanation={shouldShowExplanation(state)}
            done={state.historyCursor > 0 || state.done}
            onResponse={handleResponse}
            onConfigureWord={handleConfigureWord}
          />
          {shouldShowNavBackButton(state) && (
            <NavButton
              direction="prev"
              className="hidden md:block mt-20 absolute left-0 top-0 -ml-20"
              onClick={() => dispatch({ type: "back" })}
            />
          )}
          {shouldShowNavNextButton(state) && (
            <NavButton
              direction="next"
              className="hidden md:block mt-20 absolute right-0 top-0 -mr-20"
              onClick={() => dispatch({ type: "next" })}
            />
          )}
        </div>
      )}
      {shouldShowNextButton(state) && (
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
      <div className="fixed z-10 right-0 bottom-0 p-3 md:p-4 flex flex-col items-center gap-2">
        <SearchButton onClick={handleSearch} />
        <AddButton onClick={handleAdd} />
      </div>
      <Modal state={state} dispatch={dispatch} />
      {state.settings.debug && (
        <Debugger words={state.words} weights={state.weights} maxCount={20} />
      )}
    </div>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<InitialStateArgs>> {
  const sessionId =
    typeof ctx.params?.sessionId === "string"
      ? ctx.params.sessionId
      : undefined;

  if (sessionId === undefined) {
    return { redirect: { statusCode: 302, destination: "/" } };
  }

  const settings = decode(ctx.query);
  const time0 = process.uptime() * 1000;
  const [words, logs] = await Promise.all([
    listWords(settings),
    listLearningLogs(sessionId),
  ]);
  const time1 = process.uptime() * 1000;
  const progress = restoreFromLogs(logs);
  const weights = createWeights(words, progress);
  const time2 = process.uptime() * 1000;

  ctx.res.setHeader(
    "Server-Timing",
    `db;dur=${Math.ceil(time1 - time0)}, app;dur=${Math.ceil(time2 - time1)}`
  );

  return {
    props: {
      settings,
      words,
      weights,
      progress,
      question: createQuestion(createWeights(words, progress), words) ?? null,
      sessionId,
    },
  };
}
