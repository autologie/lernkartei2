export function chunk(
  children: string
): { segment: string; isMatch: boolean }[] {
  const regex = /\[\[([^(\]\])]+)\]\]/g;
  const segments: { segment: string; isMatch: boolean }[] = [];
  let index = 0;

  while (true) {
    const matched = regex.exec(children);

    if (matched === null) {
      segments.push({
        segment: children.slice(index, children.length),
        isMatch: false,
      });
      break;
    }

    const nextIndex = matched.index + matched[0].length;

    segments.push({
      segment: children.slice(index, matched.index),
      isMatch: false,
    });

    if ((matched[1] ?? "").length > 0) {
      const inner = matched[1].match(/^(["]*)([^",.?!]+)([",.?!]*)$/);

      if (inner !== null) {
        const [, prefix = "", body, suffix = ""] = inner;

        segments.push(
          { segment: prefix, isMatch: false },
          { segment: body, isMatch: true },
          { segment: suffix, isMatch: false }
        );
      }
    }

    index = nextIndex;
  }

  return segments.filter((s) => s.segment.length > 0);
}
