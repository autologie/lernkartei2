import { ReactNode } from "react";

export default function ExampleText({
  children,
  mode,
}: {
  children: string;
  mode: "mask" | "italic";
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
      segments.push(children.slice(index, children.length));
      break;
    }

    const nextIndex = matched.index + matched[0].length;

    segments.push(
      children.slice(index, matched.index),
      <i>{children.slice(matched.index + 2, nextIndex - 2)}</i>
    );

    index = nextIndex;
  }

  return <>{segments}</>;
}
