export type RandomSource = (maxExclusive: number) => number;

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer');
  }

  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % maxExclusive);
    const buffer = new Uint32Array(1);
    do {
      cryptoApi.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

export function shuffle<T>(items: readonly T[], randomInt: RandomSource = secureRandomInt): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
