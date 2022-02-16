import { ReactNode } from "react";

export default function QuestionTemplate({
  question,
  choices,
  response,
  isCorrect,
  onResponse,
}: {
  question: ReactNode;
  choices: string[];
  response?: number;
  isCorrect: boolean;
  onResponse: (response: number) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl py-4">{question}</h2>
      <ol className="flex items-stretch flex-col gap-2">
        {choices.map((c, index) => (
          <li key={index}>
            <button
              className={`flex items-start w-full transition-colors text-xl rounded-xl py-2 px-4 text-left ${
                response === undefined || index !== response
                  ? `bg-gray-200 ${isCorrect ? "" : "hover:bg-gray-300"}`
                  : isCorrect
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
              onClick={isCorrect ? undefined : () => onResponse(index)}
            >
              <div className="mr-4">{index + 1}</div>
              {c}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
