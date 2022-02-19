import { Fragment, ReactNode } from "react";

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
  const regex = /\[\[[^\].,?!]+(,|\?|.|!)?\]\]/g;

  if (mode === "mask") {
    return (
      <>
        {children.replaceAll(regex, (_, symbol) => {
          return `_____${symbol === undefined ? "" : ` ${symbol}`}`;
        })}
      </>
    );
  }

  const segments: ReactNode[] = [];
  let index = 0;

  while (true) {
    const matched = regex.exec(children);

    if (matched === null) {
      segments.push(
        <Fragment key={index * 3}>
          {children.slice(index, children.length)}
        </Fragment>
      );
      break;
    }

    const nextIndex = matched.index + matched[0].length;

    segments.push(
      <Fragment key={index * 3}>
        {children.slice(index, matched.index)}
      </Fragment>,
      <i
        key={index * 3 + 1}
        className={mode === "italic-green" ? "text-green-600" : ""}
      >
        {children.slice(
          matched.index + 2,
          nextIndex - 2 - (matched[1]?.length ?? 0)
        )}
      </i>,
      <Fragment key={index * 3 + 2}>
        {matched[1] === undefined ? "" : matched[1]}
      </Fragment>
    );

    index = nextIndex;
  }

  return <>{segments}</>;
}
