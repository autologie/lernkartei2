import { Random } from "./Random";

export function shuffle<T>(arr: T[], random: Random): T[] {
  const res = [...arr];

  for (let currentIndex = res.length - 1; currentIndex >= 0; currentIndex--) {
    const randomIndex = Math.floor(random() * currentIndex);

    [res[currentIndex], res[randomIndex]] = [
      res[randomIndex],
      res[currentIndex],
    ];
  }

  return res;
}

export function getRandomIndex(arr: unknown[], random: Random): number {
  if (arr.length === 0) {
    throw Error();
  }

  return Math.floor(random() * arr.length);
}
