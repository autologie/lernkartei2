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

export function getRandomIndex(arr: unknown[]): number {
  if (arr.length === 0) {
    throw Error();
  }

  return Math.floor(Math.random() * arr.length);
}

export function getRandomElement<T>(arr: T[]): T {
  const index = getRandomIndex(arr);

  if (index === undefined) {
    throw Error();
  }

  return arr[index];
}
