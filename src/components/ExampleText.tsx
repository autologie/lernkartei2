import { Fragment, ReactNode } from "react";

export default function ExampleText({
  children,
  mode,
}: {
  children: string;
  mode: "mask" | "italic" | "italic-green";
}) {
  const regex = /\[\[[^\].,?]+(,|\?|.)?\]\]/g;

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
        <Fragment key={index * 2}>
          {children.slice(index, children.length)}
        </Fragment>
      );
      break;
    }

    const nextIndex = matched.index + matched[0].length;

    segments.push(
      <Fragment key={index * 2}>
        {children.slice(index, matched.index)}
      </Fragment>,
      <i
        key={index * 2 + 1}
        className={mode === "italic-green" ? "text-green-600" : ""}
      >
        {children.slice(matched.index + 2, nextIndex - 2)}
      </i>
    );

    index = nextIndex;
  }

  return <>{segments}</>;
}
