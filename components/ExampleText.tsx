import { Fragment } from "react";
import { chunk } from "../models/String";

export default function ExampleText({
  children: children_,
  mode,
}: {
  children: string;
  mode: "mask" | "italic" | "italic-green";
}) {
  const children = children_
    .replace(/{[^}]*}/, "")
    .replace(/\[\[mit (Genitiv|Dativ|Akkusativ|Nominativ):\]\]/, "")
    .trim(); // remove math equation notation

  if (mode === "mask") {
    return (
      <>
        {chunk(children)
          .map(({ segment, isMatch }) => (isMatch ? "_____" : segment))
          .join("")}
      </>
    );
  }

  return (
    <>
      {chunk(children).map(({ segment, isMatch }, index) =>
        isMatch ? (
          <i
            key={index}
            className={mode === "italic-green" ? "text-green-600" : ""}
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
