export interface ExampleTextChunk {
  text: string;
  isMatch: boolean;
}

export function chunk(children: string): ExampleTextChunk[] {
  const regex = /\[\[([^(\]\])]+)\]\]/g;
  const segments: ExampleTextChunk[] = [];
  let index = 0;

  while (true) {
    const matched = regex.exec(children);

    if (matched === null) {
      segments.push({
        text: children.slice(index, children.length),
        isMatch: false,
      });
      break;
    }

    const nextIndex = matched.index + matched[0].length;

    segments.push({
      text: children.slice(index, matched.index),
      isMatch: false,
    });

    if ((matched[1] ?? "").length > 0) {
      const inner = matched[1].match(/^(["]*)([^",.?!]+)([",.?!]*)$/);

      if (inner !== null) {
        const [, prefix = "", body, suffix = ""] = inner;

        segments.push(
          { text: prefix, isMatch: false },
          { text: body, isMatch: true },
          { text: suffix, isMatch: false }
        );
      }
    }

    index = nextIndex;
  }

  return segments.filter((s) => s.text.length > 0);
}

export function createChunks(exampleText: string): ExampleTextChunk[] {
  return chunk(
    exampleText
      .replace(/{[^}]*}/, "")
      .replace(/\[\[mit (Genitiv|Dativ|Akkusativ|Nominativ):\]\]/, "") // remove math equation notation
      .trim()
  );
}
