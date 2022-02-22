import { questionTypes } from "../models/Question";
import { Word } from "../models/Word";
import { Weights } from "../models/Weights";
import React from "react";

export default function Debugger({
  words,
  weights,
  maxCount,
}: {
  words: Word[];
  weights: Weights;
  maxCount: number;
}) {
  const maxWeight = Math.max(
    ...Object.values(weights).flatMap((b) =>
      Object.values(b ?? {}).flatMap((c) => Object.values(c ?? {}))
    )
  );

  return (
    <div className="fixed bottom-0 left-0 text-xs max-h-screen overflow-auto bg-black bg-opacity-10">
      <table className="border-collapse m-4 mt-32">
        <thead>
          <tr>
            <th></th>
            <th></th>
            {questionTypes.map((t) => (
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
                Math.max(...Object.values(b ?? {})) -
                Math.max(...Object.values(a ?? {}))
            )
            .slice(0, maxCount)
            .map(([w, i, myWeight]) => (
              <tr key={`${w.german}-${i}`}>
                <td className="pr-2 text-right">{w.german}</td>
                <td className="w-4">{i + 1}</td>
                {questionTypes.map((t) => (
                  <td key={t} className="p-0">
                    <Tile weight={(myWeight?.[t] ?? 0) / maxWeight} />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

const Tile = React.memo(function Title_({ weight }: { weight: number }) {
  return (
    <div
      className={`w-5 h-5 m-0.5 cursor-default rounded text-transparent hover:text-black flex items-center justify-center`}
      style={{
        backgroundColor: `hsla(0, 50%, 50%, ${Math.log2(1 + weight)})`,
        fontSize: "0.5rem",
      }}
    >
      {weight.toFixed(3)}
    </div>
  );
});
