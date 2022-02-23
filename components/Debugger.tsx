import { Question, questionTypes } from "../models/Question";
import { Word } from "../models/Word";
import { Weights } from "../models/Weights";
import React, { useMemo } from "react";
import {
  LearningProgress,
  LearningProgressEntry,
} from "../models/LearningProgress";

export default function Debugger({
  words,
  weights,
  maxCount,
  progress,
  currentQuestion,
}: {
  currentQuestion?: Question;
  words: Word[];
  weights: Weights;
  maxCount: number;
  progress: LearningProgress;
}) {
  const weightList = Object.values(weights).flatMap((b) =>
    Object.values(b ?? {}).flatMap((c) => Object.values(c ?? {}))
  );
  const maxWeight = Math.max(...weightList);
  const sumWeight = weightList.reduce((a, b) => a + b, 0) / maxWeight;
  const currentQuestionWeight = useMemo(() => {
    if (currentQuestion === undefined) {
      return;
    }

    const v =
      weights[currentQuestion.word]?.[currentQuestion.definitionIndex]?.[
        currentQuestion.type
      ];

    return v === undefined ? v : v / maxWeight;
  }, [currentQuestion, maxWeight, weights]);

  return (
    <div className="fixed m-2 rounded bottom-0 left-0 text-xs max-h-screen text-white bg-black bg-opacity-80">
      {currentQuestion !== undefined && (
        <p className="p-2 text-lg font-semibold">
          Selected: {currentQuestionWeight?.toExponential(3) ?? "(default)"}
        </p>
      )}
      <table className="border-collapse mb-4 mt-32">
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
              w.definitions.map<
                [Word, number, NonNullable<Weights[string]>[number]]
              >((_, i) => [w, i, weights[w.german]?.[i]])
            )
            .sort(
              ([, , a], [, , b]) =>
                Math.max(0, ...Object.values(b ?? {})) -
                Math.max(0, ...Object.values(a ?? {}))
            )
            .slice(0, maxCount)
            .map(([w, i, myWeight], j) => (
              <tr
                key={`${w.german}-${i}`}
                className={`${
                  currentQuestion?.definitionIndex === i &&
                  currentQuestion?.word === w.german
                    ? "outline outline-blue-500 outline-4"
                    : ""
                }`}
              >
                <td className="pl-4 pr-2 text-right">{w.german}</td>
                <td className="w-4">{i}</td>
                {questionTypes.map((t, ti) => (
                  <td
                    key={t}
                    className={`p-0 ${
                      ti === questionTypes.length - 1 ? "pr-4" : ""
                    }`}
                  >
                    <Tile
                      weight={(myWeight?.[t] ?? 0) / maxWeight}
                      sumWeight={sumWeight}
                      progress={progress.table[w.german]?.[i]?.[t]}
                      bottom={j >= maxCount - 4}
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
  progress,
}: {
  weight: number;
  sumWeight: number;
  bottom: boolean;
  progress?: LearningProgressEntry;
}) {
  return (
    <div
      className={`group cursor-pointer hover:outline outline-white relative w-5 h-5 m-0.5 cursor-default rounded flex items-center justify-center`}
      style={{
        backgroundColor: `hsla(0, 50%, 50%, ${Math.log2(1 + weight)})`,
      }}
    >
      {progress?.certainty ?? ""}
      <div
        className={`z-10 font-light text-xs my-2 w-64 text-white absolute ${
          bottom ? "bottom-full" : "top-full"
        } p-2 bg-black bg-opacity-90 rounded hidden group-hover:block leading-relaxed`}
      >
        <div>
          Weight: {weight.toPrecision(3)} (
          {((100 * weight) / sumWeight).toPrecision(3)}%)
        </div>
        <div>Missed: {progress?.miss === true ? "Yes" : "-"}</div>
        <div>Certainty: {progress?.certainty ?? "-"}</div>
        <div>
          Last encountered:{" "}
          {progress?.lastEncounteredTick === undefined
            ? "-"
            : `#${progress.lastEncounteredTick}`}
        </div>
      </div>
    </div>
  );
});
