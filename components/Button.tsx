import { ReactNode } from "react";
import styles from "./Button.module.css";

export default function Button({
  children,
  className,
  color,
  standout,
  fixedWidth,
  disabled,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  color: "gray" | "blue";
  standout?: boolean;
  fixedWidth?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`${fixedWidth ? "" : "px-12 md:px-24"} relative ${
        color === "blue"
          ? "bg-blue-500 text-white dark:bg-blue-800 dark:text-blue-200"
          : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
      } block transition-colors rounded-xl p-2 text-base font-light ${
        className ?? ""
      } ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {standout && (
        <span
          className={`absolute left-0 top-0 rounded-2xl ${
            color === "blue"
              ? "bg-blue-500 dark:bg-blue-900"
              : "bg-gray-200 dark:bg-blue-800"
          } ${styles.button_ping}`}
        ></span>
      )}
      {children}
    </button>
  );
}
