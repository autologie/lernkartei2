import { Fragment } from "react";

function collectItems<T>(
  children: string,
  factory: (
    segment: string,
    kind: "tail" | "match" | "pre" | "symbol",
    key: number
  ) => T
): T[] {
  const regex = /\[\[[^\].,?!]+(,|\?|.|!)?\]\]/g;
  const segments: T[] = [];
  let index = 0;

  while (true) {
    const matched = regex.exec(children);

    if (matched === null) {
      segments.push(
        factory(children.slice(index, children.length), "tail", 3 * index)
      );
      break;
    }

    const nextIndex = matched.index + matched[0].length;

    segments.push(
      factory(children.slice(index, matched.index), "pre", 3 * index),
      factory(
        children.slice(
          matched.index + 2,
          nextIndex - 2 - (matched[1]?.length ?? 0)
        ),
        "match",
        3 * index + 1
      ),
      factory(matched[1] ?? "", "symbol", 3 * index + 2)
    );

    index = nextIndex;
  }

  return segments;
}

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
        {collectItems(children, (segment, kind) =>
          kind === "match"
            ? "_____"
            : kind === "symbol"
            ? ` ${segment}`
            : segment
        ).join("")}
      </>
    );
  }

  return (
    <>
      {collectItems(children, (segment, kind, key) =>
        kind === "match" ? (
          <i
            key={key}
            className={mode === "italic-green" ? "text-green-600" : ""}
          >
            {segment}
          </i>
        ) : (
          <Fragment key={key}>{segment}</Fragment>
        )
      )}
    </>
  );
}
