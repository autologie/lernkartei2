import { Question, questionTypes } from "../models/Question";
import { Word } from "../models/Word";
import { DefinitionWeights, Weights } from "../models/Weights";
import React, { Dispatch, useMemo } from "react";
import {
  LearningProgress,
  TypeLearningProgress,
} from "../models/LearningProgress";
import { Action } from "../models/State";

export default function Debugger({
  words,
  weights,
  maxCount,
  progress,
  currentQuestion,
  dispatch,
}: {
  currentQuestion?: Question;
  words: Word[];
  weights: Weights;
  maxCount: number;
  progress: LearningProgress;
  dispatch: Dispatch<Action>;
}) {
  const weightList = Object.values(weights.values).flatMap((b) =>
    Object.values(b?.values ?? {}).flatMap((c) =>
      Object.values(c?.values ?? {})
    )
  );
  const maxWeight = Math.max(...weightList);
  const sumWeight = weights.value / maxWeight;
  const currentQuestionWeight = useMemo(() => {
    if (currentQuestion === undefined) {
      return;
    }

    const v =
      weights.values[currentQuestion.word]?.values[
        currentQuestion.definitionIndex
      ]?.values[currentQuestion.type];

    return v === undefined
      ? v
      : ((100 * (v / maxWeight)) / sumWeight).toPrecision(3);
  }, [currentQuestion, maxWeight, sumWeight, weights]);

  return (
    <div className="fixed m-2 rounded bottom-0 left-0 text-xs max-h-screen text-white bg-black bg-opacity-80">
      {currentQuestionWeight !== undefined && (
        <p className="p-2 text-lg font-semibold">
          Selected: {currentQuestionWeight}%
        </p>
      )}
      <table className="border-collapse m-4 mt-32">
        <thead>
          <tr>
            <th></th>
            <th></th>
            {questionTypes.map((t, ti) => (
              <th key={t} className="p-0 relative">
                <div className="absolute right-0 bottom-0 h-4 w-32 transform rotate-45 origin-right text-right mb-2 mr-2">
                  {t}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...words]
            .flatMap((w) =>
              w.definitions.map<[Word, number, DefinitionWeights | undefined]>(
                (_, i) => [w, i, weights.values[w.german]?.values[i]]
              )
            )
            .sort(
              ([, , a], [, , b]) =>
                Math.max(0, ...Object.values(b?.values ?? {})) -
                Math.max(0, ...Object.values(a?.values ?? {}))
            )
            .slice(0, maxCount)
            .map(([w, i, myWeight], j) => (
              <tr key={`${w.german}-${i}`}>
                <td className="pr-2 text-right">
                  <button
                    onClick={() => dispatch({ type: "view-word", payload: w })}
                  >
                    {w.german}
                  </button>
                </td>
                <td className="w-4">{i}</td>
                {questionTypes.map((t) => (
                  <td key={t} className={`p-0`}>
                    <Tile
                      weight={(myWeight?.values[t] ?? 0) / maxWeight}
                      sumWeight={sumWeight}
                      progress={progress.table[w.german]?.table[i]?.table[t]}
                      bottom={j >= maxCount - 4}
                      isCurrent={
                        currentQuestion?.word === w.german &&
                        currentQuestion.definitionIndex === i &&
                        currentQuestion.type === t
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

const Tile = React.memo(function Title_({
  weight,
  sumWeight,
  bottom,
  isCurrent,
  progress,
}: {
  weight: number;
  sumWeight: number;
  bottom: boolean;
  isCurrent: boolean;
  progress?: TypeLearningProgress;
}) {
  return (
    <div
      className={`group cursor-pointer relative w-5 h-5 m-0.5 cursor-default rounded flex items-center justify-center ${
        isCurrent
          ? "outline outline-white outline-2"
          : "hover:outline outline-white"
      }`}
      style={{
        backgroundColor: `hsla(0, 50%, 50%, ${weight})`,
      }}
    >
      {progress?.certainty ?? ""}
      <div
        className={`z-10 font-light text-xs my-2 text-white absolute ${
          bottom ? "bottom-full" : "top-full"
        } p-2 bg-black bg-opacity-90 rounded hidden group-hover:block leading-relaxed`}
      >
        <div className="whitespace-pre">
          Weight: {((100 * weight) / sumWeight).toPrecision(3)}%
        </div>
        <div className="whitespace-pre">
          Missed: {progress?.miss === true ? "Yes" : "-"}
        </div>
        <div className="whitespace-pre">
          Certainty: {progress?.certainty ?? "-"}
        </div>
        <div className="whitespace-pre">
          Last encountered:{" "}
          {progress?.lastTick === undefined ? "-" : `#${progress.lastTick}`}
        </div>
      </div>
    </div>
  );
});
