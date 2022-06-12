import { useEffect, useRef, useState } from "react";
import { Response } from "../models/Response";
import styles from "./WordGuessInput.module.css";

export default function WordGuessInput({
  answer,
  value,
  className,
  missResponses,
  done,
  size = "md",
  placeholder,
  onChange,
}: {
  answer: string;
  className?: string;
  placeholder?: string;
  value: string;
  size?: "md" | "lg";
  missResponses: Response[];
  done: boolean;
  onChange?: (response: string) => void;
}) {
  const wasDone = useRef(done);
  const [shouldTriggerWrongAnimation, setTriggerWrongAnimation] =
    useState(false);
  const [shouldTriggerHitAnimation, setTriggerHitAnimation] = useState(false);

  useEffect(() => {
    setTriggerWrongAnimation(!done && missResponses.length > 0);
  }, [done, missResponses.length]);

  useEffect(() => {
    setTriggerHitAnimation(
      !wasDone.current && done && missResponses.length === 0
    );
  }, [done, missResponses.length]);

  return (
    <span className={`${className ?? ""} relative`}>
      <input
        type="text"
        autoFocus={!done}
        tabIndex={done ? undefined : 0}
        className={`placeholder:opacity-50 placeholder:italic focus:ring outline-none rounded ${
          size === "lg" ? "px-4 py-2 w-64" : "px-2 w-48"
        } ${
          missResponses.length > 0
            ? "bg-transparent ring ring-red-500 text-red-500"
            : done
            ? "bg-transparent ring ring-green-600 dark:ring-green-700 text-green-600 dark:text-green-700"
            : "bg-gray-100 dark:bg-gray-800"
        } ${shouldTriggerWrongAnimation ? styles.wrong : ""}`}
        value={done ? answer : value}
        readOnly={done}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onAnimationEnd={() => setTriggerWrongAnimation(false)}
      />
      <div
        className={`${
          shouldTriggerHitAnimation ? styles.hit : ""
        } pointer-events-none absolute left-0 top-0  bg-green-500 dark:bg-gray-800 rounded-2xl z-10`}
      />
    </span>
  );
}
