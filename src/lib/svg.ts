// SVGs exported from Penpot load their fonts from Penpot's servers through @font-face. The published
// diagrams drop those blocks and fall back to system fonts, so they render the same anywhere.
const FALLBACKS: [family: string, stack: string][] = [
  ['Geist Mono', "'Geist Mono', ui-monospace, Consolas, monospace"],
  ['Geist', "Geist, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"],
];
// The family alone, optionally quoted (Penpot escapes quotes as &quot; inside attributes).
const QUOTE = `(?:&quot;|'|")?`;

export function postprocessSvg(svg: string): string {
  let out = svg.replace(/<style[^>]*>(?:(?!<\/style>)[\s\S])*?@font-face[\s\S]*?<\/style>/g, '');
  for (const [family, stack] of FALLBACKS) {
    // Only a family named alone is rewritten, so running the script twice changes nothing.
    out = out
      .replace(new RegExp(`font-family:\\s*${QUOTE}${family}${QUOTE}\\s*(?=[;"}])`, 'g'), `font-family: ${stack}`)
      .replace(new RegExp(`font-family="${QUOTE}${family}${QUOTE}"`, 'g'), `font-family="${stack}"`);
  }
  return out;
}

// Every colour an SVG paints with, as lowercase #rrggbb (fill, stroke and stop-color, as
// attributes or in style).
export function svgColours(svg: string): string[] {
  const found = new Set<string>();
  const pattern = /(?:fill|stroke|stop-color)\s*[:=]\s*["']?\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))/gi;
  for (const [, value] of svg.matchAll(pattern)) found.add(normalise(value));
  return [...found];
}

function normalise(value: string): string {
  const v = value.toLowerCase();
  if (v.startsWith('rgb')) {
    const [r, g, b] = v.match(/[\d.]+/g)!.map(Number);
    return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`;
  }
  if (v.length === 4 || v.length === 5) return `#${[...v.slice(1, 4)].map((c) => c + c).join('')}`;
  return v.slice(0, 7);
}
