// The dot grid of the queue and done glyphs: 14 × 8 = 112, the count case 03 states.
export const GRID = { columns: 14, rows: 8 } as const;

export const stepAfter = (current: number, delta: -1 | 1, total: number) =>
  Math.min(Math.max(current + delta, 0), total - 1);

export const leadingCount = (value: string) => {
  const match = /\d+/.exec(value);
  return match ? Number(match[0]) : undefined;
};
