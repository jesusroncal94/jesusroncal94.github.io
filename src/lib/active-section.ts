export interface SectionBox {
  id: string;
  top: number;
  bottom: number;
}

// The section being read is the one whose box contains the reading line, in viewport coordinates.
export const currentSection = (line: number, sections: readonly SectionBox[]) =>
  sections.find(({ top, bottom }) => top <= line && line < bottom)?.id;
