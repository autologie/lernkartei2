import { Fragment } from "react";
import { ExampleTextChunk } from "../models/ExampleTextChunk";

export default function ExampleText({
  children,
  mode,
  wordInput,
}: {
  children: ExampleTextChunk[];
  mode: "mask" | "italic" | "input" | "italic-green";
  wordInput?: (index: number) => JSX.Element;
}) {
  if (mode === "mask" || mode === "input") {
    return (
      <>
        {children.map(({ text, isMatch }, i) => (
          <Fragment key={i}>
            {isMatch ? (mode === "mask" ? "_____" : wordInput?.(i)) : text}
          </Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {children.map(({ text: segment, isMatch }, index) =>
        isMatch ? (
          <i
            key={index}
            className={
              mode === "italic-green"
                ? "text-green-600 dark:text-green-700"
                : ""
            }
          >
            {segment}
          </i>
        ) : (
          <Fragment key={index}>{segment}</Fragment>
        )
      )}
    </>
  );
}
