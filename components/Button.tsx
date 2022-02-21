import { ReactNode } from "react";
import styles from "./Button.module.css";

export default function Button({
  children,
  className,
  color,
  standout,
  fixedWidth,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  color: "gray" | "blue";
  standout?: boolean;
  fixedWidth?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`${fixedWidth ? "" : "px-24"} relative ${
        color === "blue"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 hover:bg-gray-300"
      } block transition-colors rounded-xl p-2 text-base font-light ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      {standout && (
        <span
          className={`absolute left-0 top-0 rounded-2xl ${
            color === "blue" ? "bg-blue-500" : "bg-gray-200"
          } ${styles.button_ping}`}
        ></span>
      )}
      {children}
    </button>
  );
}
