// The dot grid of the queue and done glyphs: 14 × 8 = 112, the count case 03 states.
export const GRID = { columns: 14, rows: 8 } as const;

export const stepAfter = (current: number, delta: -1 | 1, total: number) =>
  Math.min(Math.max(current + delta, 0), total - 1);

// "45.6%", "45,6 %" or "100 %" (with a plain or non-breaking space); anything else is not a percentage.
export const percentOf = (value: string) => {
  const match = /^\s*(\d+(?:[.,]\d+)?)\s*%\s*$/.exec(value);
  return match ? Number(match[1].replace(',', '.')) : undefined;
};

// A dollar amount: "$15/day" or "$15/día" → 15, "$0" → 0; a range keeps its first figure.
export const amountOf = (value: string) => {
  const match = /\$(\d+(?:\.\d+)?)/.exec(value);
  return match ? Number(match[1]) : undefined;
};

export const leadingCount = (value: string) => {
  const match = /\d+/.exec(value);
  return match ? Number(match[0]) : undefined;
};
