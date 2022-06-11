import { useState } from "react";
import { Response } from "../models/Response";

export default function WordGuessInput({
  answer,
  className,
  missResponses,
  done,
  onSubmit,
}: {
  answer: string;
  className?: string;
  missResponses: Response[];
  done: boolean;
  onSubmit?: (response: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit?.(value);
      }}
    >
      <input
        type="text"
        autoFocus={!done}
        tabIndex={done ? undefined : 0}
        className={`outline-none ring w-48 rounded px-2 ${
          missResponses.length > 0
            ? "ring-red-500"
            : done
            ? "ring-green-600 text-green-600 dark:text-green-700"
            : "bg-gray-100"
        }`}
        value={done ? answer : value}
        readOnly={done}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
