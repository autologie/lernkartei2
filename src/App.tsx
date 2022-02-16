import { Dispatch, useCallback, useEffect, useReducer } from "react";
import Question from "./components/Question";
import { Action, applyAction, getInitialState, State } from "./models/State";

function useNextAutomatically(
  afterMillis: number,
  state: State,
  dispatch: Dispatch<Action>
) {
  const shouldTrigger = state.response === state.question?.answerIndex;

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

function App() {
  const [state, dispatch] = useReducer(applyAction, undefined, getInitialState);
  const handleResponse = useCallback(
    (chosen: number) => dispatch({ type: "respond", payload: chosen }),
    []
  );

  useRemoteWords(dispatch);
  useNextAutomatically(1000, state, dispatch);

  return (
    <div className="p-4 max-w-prose mx-auto">
      <h1>Lernkartei v2</h1>
      {state.question === undefined ? (
        <p>Loading...</p>
      ) : (
        <Question
          question={state.question}
          response={state.response}
          onResponse={handleResponse}
        />
      )}
      {state.response !== undefined && (
        <button
          className="block mx-auto mt-4 bg-gray-200 rounded-xl py-2 px-4 text-xl"
          onClick={() => dispatch({ type: "next" })}
        >
          Next
        </button>
      )}
      <button
        className="absolute right-0 bottom-0 m-4 flex items-center justify-center bg-blue-500 rounded-full w-16 h-16 text-4xl text-white"
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
