import { Fragment, useState } from "react";
import { chunk } from "../models/String";

export default function ExampleText({
  children: children_,
  mode,
  wordInput,
}: {
  children: string;
  mode: "mask" | "italic" | "input" | "italic-green";
  wordInput?: JSX.Element;
}) {
  const children = children_
    .replace(/{[^}]*}/, "")
    .replace(/\[\[mit (Genitiv|Dativ|Akkusativ|Nominativ):\]\]/, "")
    .trim(); // remove math equation notation

  if (mode === "mask" || mode === "input") {
    return (
      <>
        {chunk(children).map(({ segment, isMatch }, i) => (
          <Fragment key={i}>
            {isMatch ? (mode === "mask" ? "_____" : wordInput) : segment}
          </Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {chunk(children).map(({ segment, isMatch }, index) =>
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
