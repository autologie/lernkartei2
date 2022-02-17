export function mask(text: string): string {
  return text.replaceAll(/\[\[[^\].,?]+(,|\?|.)?\]\]/g, (_, symbol) => {
    return `_____${symbol === undefined ? "" : ` ${symbol}`}`;
  });
}
