import { questionTypes } from "../models/Question";
import { Word } from "../models/Word";
import { Weights } from "../models/Weights";

export default function Debugger({
  words,
  weights,
}: {
  words: Word[];
  weights: Weights;
}) {
  const maxWeight = Math.max(
    ...Object.values(weights).flatMap((b) => Object.values(b ?? {}))
  );

  return (
    <div className="fixed bottom-0 left-0 text-xs max-h-screen overflow-auto">
      <table className="border-collapse m-4 mt-32">
        <thead>
          <tr>
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
            .sort((a, b) => a.german.localeCompare(b.german))
            .map((w) => (
              <tr key={w.german}>
                <td className="pr-2 text-right">{w.german}</td>
                {questionTypes.map((t) => (
                  <td key={t} className="p-0">
                    <Tile weight={(weights[w.german]?.[t] ?? 0) / maxWeight} />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function Tile({ weight }: { weight: number }) {
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
}
