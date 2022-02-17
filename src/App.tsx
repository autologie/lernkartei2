import { useCallback, useReducer } from "react";
import AddButton from "./components/AddButton";
import NextButton from "./components/NextButton";
import PrevButton from "./components/PrevButton";
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
              <PrevButton
                className="mt-4 absolute left-0 top-0 -ml-10"
                onClick={() => dispatch({ type: "back" })}
              />
            )}
          {state.historyCursor !== undefined && (
            <NextButton
              className="mt-4 absolute right-0 top-0 -mr-10"
              onClick={() => dispatch({ type: "next" })}
            />
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
      <AddButton className="fixed right-0 bottom-0 m-4" onClick={handleAdd} />
    </div>
  );
}

export default App;
