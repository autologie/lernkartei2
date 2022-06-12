import { Response } from "../models/Response";

export default function WordGuessInput({
  answer,
  value,
  className,
  missResponses,
  done,
  size = "md",
  onChange,
}: {
  answer: string;
  className?: string;
  value: string;
  size?: "md" | "lg";
  missResponses: Response[];
  done: boolean;
  onChange?: (response: string) => void;
}) {
  return (
    <input
      type="text"
      autoFocus={!done}
      tabIndex={done ? undefined : 0}
      className={`${className ?? ""} focus:ring outline-none rounded ${
        size === "lg" ? "px-4 py-2 w-64" : "px-2 w-48"
      } ${
        done
          ? "ring ring-green-600 text-green-600 dark:text-green-700"
          : missResponses.length > 0
          ? "ring ring-red-500"
          : "bg-gray-100"
      }`}
      value={done ? answer : value}
      readOnly={done}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
