import { useCallback, useReducer } from "react";
import Question from "./components/Question";
import useAddNewWord from "./hooks/useAddNewWord";
import useKeyEventListener from "./hooks/useKeyEventListener";
import useNextAutomatically from "./hooks/useNextAutomatically";
import useRemoteWords from "./hooks/useRemoteWords";
import { applyAction, getInitialState } from "./models/State";

function noop() {}

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
  const handleAdd = useAddNewWord(dispatch);

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
        onClick={handleAdd}
      >
        +
      </button>
    </div>
  );
}

export default App;
