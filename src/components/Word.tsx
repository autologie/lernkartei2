import { Word as WordModel } from "../models/Word";

export default function Word({
  word,
  className,
}: {
  word: WordModel;
  className?: string;
}) {
  return (
    <div className={`bg-blue-200 rounded-lg p-4 ${className ?? ""}`}>
      <h3 className="mb-2 text-xl font-semibold">{word.german}</h3>
      <ul className="flex flex-col gap-2">
        {word.definitions.map((def, i) => (
          <li key={i} className="flex items-start">
            <span className="flex-shrink-0 text-center block text-xs text-black text-opacity-70 bg-blue-300 rounded-lg py-1 w-6 mr-2">
              {i + 1}
            </span>
            {def.definition}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-opacity-70 text-black">
        Source:{" "}
        <a
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://de.wiktionary.org/wiki/${encodeURIComponent(
            word.german
          )}`}
        >
          Wiktionary
        </a>
      </p>
    </div>
  );
}
