import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useReducer, useState } from "react";
import Button from "../components/Button";
import NavButton from "../components/NavButton";
import NothingToShow from "../components/NothingToShow";
import Question from "../components/Question";
import SearchButton from "../components/SearchButton";
import WordNotFound from "../components/WordNotFound";
import { getLearningProgress, listWords } from "../fauna";
import useAddNewWord from "../hooks/useAddNewWord";
import useKeyEventListener from "../hooks/useKeyEventListener";
import useLogSync from "../hooks/useLogSync";
import useNextAutomatically from "../hooks/useNextAutomatically";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { decode } from "../models/Settings";
import {
  applyAction,
  getInitialState,
  State,
  isNewerQuestion,
  shouldShowExplanation,
  shouldShowNavBackButton,
  shouldShowNavNextButton,
  shouldShowNextButton,
} from "../models/State";
import { isValidSessionId } from "../models/String";
import { Word as WordModel } from "../models/Word";
import hash from "object-hash";
import { useWordBookCache } from "../hooks/useWordBookCache";

const Modal = dynamic(() => import("../components/Modal"), {
  suspense: true,
});
const Debugger = dynamic(() => import("../components/Debugger"), {
  suspense: true,
});

export default function Session(initialState: State) {
  const [state, dispatch] = useReducer(applyAction, initialState);
  const [isMounted, setMounted] = useState(false);
  const item =
    state.history.length === 0 ? undefined : state.history[state.historyCursor];
  const word = state.words.words.find((w) => w.german === item?.question.word);
  const handleResponse = useCallback(
    (chosen: number) => dispatch({ type: "respond", payload: chosen }),
    []
  );
  const handleConfigureWord = useCallback(
    (word: WordModel) => dispatch({ type: "configure-word", payload: word }),
    []
  );
  const handleRequestHint = useCallback(
    () => dispatch({ type: "show-hint" }),
    []
  );
  const handleSearch = useCallback(
    () => dispatch({ type: "search", payload: "" }),
    []
  );

  useNextAutomatically(500, state, dispatch);
  useKeyEventListener(state, dispatch);
  useSwipeNavigation(dispatch);
  useLogSync(state);
  useAddNewWord(
    dispatch,
    state.modal?.type === "search" && state.modal.adding
      ? state.modal.word
      : undefined
  );
  useWordBookCache(state.words, dispatch);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }
  }, []);

  return (
    <div className="p-4 pb-24 max-w-prose mx-auto relative overflow-hidden md:overflow-visible">
      {state.words.words.length === 0 ? (
        <NothingToShow settings={state.settings} />
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
            className="mb-2 text-2xl text-gray-500 font-light hover:underline"
            onClick={() => dispatch({ type: "show-qr-code" })}
          >
            #{1 + state.progress.count - state.historyCursor}
          </button>
          <Question
            key={`${state.history.length}-${state.historyCursor}`}
            word={word}
            isNewer={isNewerQuestion(state)}
            question={item.question}
            missResponses={item.missResponses}
            showExplanation={shouldShowExplanation(state)}
            done={state.historyCursor > 0 || state.done}
            hintUsed={item.hintUsed}
            onResponse={handleResponse}
            onConfigureWord={handleConfigureWord}
            onRequestHint={handleRequestHint}
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
      </div>
      {state.modal !== undefined && (
        <Suspense fallback={null}>
          <Modal state={state} dispatch={dispatch} />
        </Suspense>
      )}
      {state.settings.debug &&
        isMounted /* NOTE: rendering Suspense on server side doesn't work */ && (
          <Suspense fallback={null}>
            <Debugger
              words={state.words.words}
              weights={state.weights}
              maxCount={20}
              progress={state.progress}
              currentQuestion={state.history[0]?.question}
            />
          </Suspense>
        )}
    </div>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<State>> {
  const sessionId =
    typeof ctx.params?.sessionId === "string" ? ctx.params.sessionId : "";
  const clientWordBookHash = ctx.req.cookies.wordBookHash;

  if (!isValidSessionId(sessionId)) {
    return { redirect: { statusCode: 302, destination: "/" } };
  }

  const settings = decode(ctx.query);
  const time0 = process.uptime() * 1000;
  const [[words, wordsTime], [progress, progressTime]] = await Promise.all([
    listWords(settings).then(pairWithTime),
    getLearningProgress(sessionId).then(pairWithTime),
  ]);
  const wordBookHash = hash(words);

  ctx.res.setHeader(
    "Server-Timing",
    Object.entries({ words: wordsTime, progress: progressTime })
      .map(([name, time]) => `${name};dur=${Math.ceil(time - time0)}`)
      .join(", ")
  );

  Object.entries({ sessionId, wordBookHash }).forEach(([name, value]) =>
    ctx.res.setHeader(
      "Set-Cookie",
      `${name}=${value}; HttpOnly; SameSite=None; Secure`
    )
  );

  return {
    props: getInitialState(
      settings,
      words,
      progress,
      sessionId,
      clientWordBookHash === wordBookHash
    ),
  };
}

function pairWithTime<T>(value: T): [T, number] {
  return [value, process.uptime() * 1000];
}
