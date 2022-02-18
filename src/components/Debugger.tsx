import { useMemo } from "react";
import { HistoryItem } from "../models/HistoryItem";
import { Question, questionTypes } from "../models/Question";
import { Word } from "../models/Word";

export default function Debugger({
  words,
  history,
}: {
  words: Word[];
  history: HistoryItem[];
}) {
  const counts = useMemo(
    () =>
      history.reduce<{
        [word: string]: {
          [key in Question["type"]]: { miss: number; hit: number };
        };
      }>((passed, h) => {
        if (passed[h.question.word.german] === undefined) {
          passed[h.question.word.german] = {
            define: { miss: 0, hit: 0 },
            "fill-blank": { miss: 0, hit: 0 },
            "translate-from": { miss: 0, hit: 0 },
            "translate-to": { miss: 0, hit: 0 },
          };
        }

        if (h.missResponses.length > 0) {
          passed[h.question.word.german][h.question.type].miss += 1;
        } else {
          passed[h.question.word.german][h.question.type].hit += 1;
        }

        return passed;
      }, {}),
    [history]
  );

  return (
    <div className="fixed bottom-0 left-0 text-xs max-h-screen overflow-auto">
      <table className="border-collapse m-4 mt-32">
        <thead>
          <tr>
            <th></th>
            <th className="p-0 relative">
              <div className="absolute right-0 bottom-0 h-4 w-32 transform rotate-45 origin-right text-right mb-2 mr-2">
                Total
              </div>
            </th>
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
          {words.map((w) => (
            <tr key={w.german}>
              <td className="pr-2 text-right">{w.german}</td>
              <td className="p-0">
                <Tile
                  miss={Object.values(counts[w.german] ?? {}).reduce(
                    (c, s) => c + s.miss,
                    0
                  )}
                  hit={Object.values(counts[w.german] ?? {}).reduce(
                    (c, s) => c + s.hit,
                    0
                  )}
                />
              </td>
              {questionTypes.map((t) => (
                <td key={t} className="p-0">
                  <Tile
                    miss={counts[w.german]?.[t]?.miss ?? 0}
                    hit={counts[w.german]?.[t]?.hit ?? 0}
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

function Tile({ miss, hit }: { miss: number; hit: number }) {
  return (
    <div
      className={`w-5 h-5 m-0.5 rounded text-white flex items-center justify-center ${
        miss === 0 && hit === 0
          ? "bg-gray-200"
          : hit > miss
          ? "bg-green-500"
          : hit === miss
          ? "bg-yellow-500"
          : "bg-red-500"
      }`}
    >
      {miss === 0 && hit === 0 ? "" : miss + hit}
    </div>
  );
}
