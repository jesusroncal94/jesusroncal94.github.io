import { describe, expect, it } from 'vitest';
import { pdfPageCount } from '../src/lib/cv';

const pdf = (body: string) => new TextEncoder().encode(`%PDF-1.4\n${body}\n%%EOF`);

describe('pdfPageCount', () => {
  it('counts page objects, not the page tree', () => {
    expect(pdfPageCount(pdf('1 0 obj << /Type /Pages /Count 2 >> 2 0 obj << /Type /Page >> 3 0 obj << /Type/Page /Parent 1 0 R >>'))).toBe(2);
  });

  it('finds no page in a file without one', () => {
    expect(pdfPageCount(pdf('1 0 obj << /Type /Catalog >>'))).toBe(0);
  });
});
