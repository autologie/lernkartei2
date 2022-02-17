import { Dispatch, useCallback, useEffect, useReducer } from "react";
import Question from "./components/Question";
import { Question as QuestionModel } from "./models/Question";
import { Action, applyAction, getInitialState, State } from "./models/State";

function noop() {}

function useNextAutomatically(
  afterMillis: number,
  state: State,
  dispatch: Dispatch<Action>
) {
  const shouldTrigger = state.missResponses.length === 0 && state.done;

  useEffect(() => {
    if (!shouldTrigger) {
      return;
    }

    const timeout = window.setTimeout(
      () => dispatch({ type: "next" }),
      afterMillis
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [afterMillis, dispatch, shouldTrigger]);
}

function useRemoteWords(dispatch: Dispatch<Action>) {
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:8080/words");

      if (res.status !== 200) {
        window.alert("Could not load data");
        return;
      }

      const data = await res.json();

      dispatch({ type: "loaded", payload: data });
    })();
  }, [dispatch]);
}

function useKeyEventListener(
  question: QuestionModel | undefined,
  dispatch: Dispatch<Action>
) {
  const choiceCount = question?.choices.length;

  useEffect(() => {
    if (choiceCount === undefined) {
      return;
    }

    const choices = Array.from({ length: choiceCount }).map((_, i) =>
      String(i + 1)
    );

    function handleEvent(e: KeyboardEvent) {
      if (e.altKey || e.shiftKey || e.metaKey || e.ctrlKey) {
        return;
      }

      if (e.key === "ArrowLeft") {
        dispatch({ type: "back" });
        return;
      }

      if (e.key === " " || e.key === "ArrowRight") {
        dispatch({ type: "next" });
        return;
      }

      if (choices.includes(e.key)) {
        dispatch({ type: "respond", payload: Number.parseInt(e.key, 10) - 1 });
      }
    }

    window.addEventListener("keydown", handleEvent);

    return () => {
      window.removeEventListener("keydown", handleEvent);
    };
  }, [choiceCount, dispatch]);
}

function App() {
  const [state, dispatch] = useReducer(applyAction, undefined, getInitialState);
  const historyToShow =
    state.historyCursor === undefined
      ? undefined
      : state.history[state.historyCursor];
  const handleResponse = useCallback(
    (chosen: number) => dispatch({ type: "respond", payload: chosen }),
    []
  );

  useRemoteWords(dispatch);
  useNextAutomatically(1000, state, dispatch);
  useKeyEventListener(state.question, dispatch);

  return (
    <div className="p-4 max-w-prose mx-auto">
      <h1>Lernkartei v2</h1>
      {state.words?.length === 0 ? (
        <p>Add a few words to get started!</p>
      ) : state.question === undefined ? (
        <p>Loading...</p>
      ) : (
        <div className="relative">
          {historyToShow === undefined ? (
            <Question
              key={state.question.word.german}
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
              key={historyToShow.question.word.german}
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
              <button
                title="Prev"
                className="mt-4 absolute left-0 top-0 block w-8 h-8 text-gray-500 rounded-full transition-colors hover:bg-gray-100 -ml-10 flex items-center justify-center"
                onClick={() => dispatch({ type: "back" })}
              >
                &lt;
              </button>
            )}
          {state.historyCursor !== undefined && (
            <button
              title="Next"
              className="mt-4 absolute right-0 top-0 block w-8 h-8 text-gray-500 rounded-full transition-colors hover:bg-gray-100 -mr-10 flex items-center justify-center"
              onClick={() => dispatch({ type: "next" })}
            >
              &gt;
            </button>
          )}
        </div>
      )}

      {state.missResponses.length > 0 &&
        state.question !== undefined &&
        state.done &&
        state.historyCursor === undefined && (
          <div>
            <button
              className="block mx-auto mt-4 bg-gray-200 rounded-xl py-2 px-12 text-xl"
              onClick={() => dispatch({ type: "next" })}
            >
              Next
            </button>
          </div>
        )}
      <button
        className="fixed right-0 bottom-0 m-4 flex items-center justify-center bg-blue-500 rounded-full w-16 h-16 text-4xl text-white"
        onClick={async () => {
          const word = window.prompt("Word");

          if (word !== null) {
            try {
              const res = await fetch(`http://localhost:8080/words/${word}`);

              if (res.status === 200) {
                dispatch({ type: "add", payload: await res.json() });
                window.alert("Added!");
              } else {
                window.alert(`Failed (status: ${res.status})`);
              }
            } catch (e) {
              window.alert(`Failed (${(e as any).message})`);
            }
          }
        }}
      >
        +
      </button>
    </div>
  );
}

export default App;
