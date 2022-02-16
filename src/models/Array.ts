export function shuffle<T>(arr: T[]): T[] {
  let res = [...arr];
  let currentIndex = res.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [res[currentIndex], res[randomIndex]] = [
      res[randomIndex],
      res[currentIndex],
    ];
  }

  return res;
}

export function getRandomIndex(arr: unknown[]): number | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  return Math.floor(Math.random() * arr.length);
}

export function getRandomElement<T>(arr: T[]): T | undefined {
  const index = getRandomIndex(arr);

  if (index === undefined) {
    return undefined;
  }

  return arr[index];
}
