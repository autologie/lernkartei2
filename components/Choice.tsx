import { ReactNode } from "react";
import { Response } from "../models/Response";
import styles from "./Choice.module.css";

export default function Choice({
  done,
  wasDone,
  isMiss,
  isHit,
  index,
  layout,
  children,
  onResponse,
}: {
  done: boolean;
  wasDone: boolean;
  isMiss: boolean;
  isHit: boolean;
  index: number;
  layout: "grid" | "list";
  children: ReactNode;
  onResponse: (response: Response) => void;
}) {
  return (
    <li>
      <button
        className={`relative ${
          !done && isMiss ? styles.wrong_choice : ""
        } border-2 border-solid border-transparent flex items-center h-full w-full transition-colors rounded-xl py-2 px-4 text-left ${
          isMiss
            ? "border-red-500 bg-gray-100 dark:border-red-900 dark:bg-gray-800"
            : isHit
            ? "bg-green-500 dark:bg-green-900 text-white dark:text-gray-300"
            : `bg-gray-100 dark:bg-gray-800 ${
                done ? "" : "hover:bg-gray-200 hover:dark:bg-gray-700"
              }`
        } ${layout === "grid" ? "text-xl" : "text-base"}`}
        onClick={() => onResponse({ type: "choice", value: index })}
      >
        <div
          className={`w-8 flex-grow-0 flex-shrink-0 font-semibold ${
            isMiss
              ? "text-red-500 dark:text-red-900 text-2xl -mt-1"
              : isHit
              ? "text-xl"
              : "text-gray-500 text-lg"
          }`}
        >
          {isHit && !wasDone && (
            <div
              className={`${styles.hit} absolute top-0 left-0 bg-green-500 dark:bg-gray-800 rounded-2xl z-10`}
            />
          )}
          {isMiss ? "×" : isHit ? "️✓︎" : index + 1}
        </div>
        {children}
      </button>
    </li>
  );
}
