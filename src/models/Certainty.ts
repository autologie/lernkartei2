export type Certainty = 0 | 1 | 2 | 3;

export function fromNumber(value: number): Certainty {
  return Math.max(0, Math.min(3, Math.floor(value))) as Certainty;
}
