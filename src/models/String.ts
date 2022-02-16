export function mask(text: string): string {
  return text.replaceAll(/\[\[[^\]]+\]\]/g, "_____");
}
