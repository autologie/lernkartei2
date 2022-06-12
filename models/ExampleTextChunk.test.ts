import { chunk } from "./ExampleTextChunk";

describe(chunk, () => {
  it("chunks an exact match", () => {
    expect(chunk("[[nachdenklich]]")).toEqual([
      { segment: "nachdenklich", isMatch: true },
    ]);
  });

  it("chunks an occurrence in a sentence", () => {
    expect(chunk("Er hat diese Frage [[nachdenklich]] gemacht.")).toEqual([
      { segment: "Er hat diese Frage ", isMatch: false },
      { segment: "nachdenklich", isMatch: true },
      { segment: " gemacht.", isMatch: false },
    ]);
  });

  it("chunks an occurrence with a period symbol", () => {
    expect(chunk("[[nachdenklich.]]")).toEqual([
      { segment: "nachdenklich", isMatch: true },
      { segment: ".", isMatch: false },
    ]);
  });

  it("chunks an occurrence with double quotes", () => {
    expect(chunk('Sei [["nachdenklich,"]] sagte er.')).toEqual([
      { segment: "Sei ", isMatch: false },
      { segment: '"', isMatch: false },
      { segment: "nachdenklich", isMatch: true },
      { segment: ',"', isMatch: false },
      { segment: " sagte er.", isMatch: false },
    ]);
  });

  it("chunks an occurrence with double quotes in a sentence", () => {
    expect(chunk('[["nachdenklich."]]')).toEqual([
      { segment: '"', isMatch: false },
      { segment: "nachdenklich", isMatch: true },
      { segment: '."', isMatch: false },
    ]);
  });

  it("chunks repeated occurrences in the beginning", () => {
    expect(chunk("[[Schritt]] für [[Schritt]] arbeiten")).toEqual([
      { segment: "Schritt", isMatch: true },
      { segment: " für ", isMatch: false },
      { segment: "Schritt", isMatch: true },
      { segment: " arbeiten", isMatch: false },
    ]);
  });

  it("chunks repeated occurrences in the end", () => {
    expect(chunk("Mach es doch [[Schritt]] für [[Schritt!]]")).toEqual([
      { segment: "Mach es doch ", isMatch: false },
      { segment: "Schritt", isMatch: true },
      { segment: " für ", isMatch: false },
      { segment: "Schritt", isMatch: true },
      { segment: "!", isMatch: false },
    ]);
  });
});
