// The dot grid of the queue and done glyphs: a 14 × 8 frame that draws exactly the count the stage states.
export const GRID = { columns: 14, rows: 8 } as const;

// "110+ PRs in 4 repos" → 7 full rows and a last row of 12; a count that does not fit the frame draws nothing.
export const dotRowsOf = (count: number | undefined) =>
  count && count > 0 && count <= GRID.columns * GRID.rows
    ? { full: Math.floor(count / GRID.columns), rest: count % GRID.columns }
    : undefined;

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

// The hourglass glyphs: four parts, each drawing the same seven rows (widths in px) and lighting its own.
export const HOURGLASS_PARTS = ['channels', 'inbound', 'facts', 'outbound'] as const;
export const HOURGLASS_ROWS = [82, 58, 34, 10, 34, 58, 82] as const;

// The segments the hourglass draws, read from the case: how many channels, inbound and outbound subagents.
export const hourglassOf = (stages: { glyph: string; detail: string }[]) => {
  const countOf = (part: string) => {
    const stage = stages.find(({ glyph }) => glyph === part);
    return stage && leadingCount(stage.detail);
  };
  const [channels, inbound, outbound] = [countOf('channels'), countOf('inbound'), countOf('outbound')];
  return channels && inbound && outbound ? { channels, inbound, outbound } : undefined;
};
