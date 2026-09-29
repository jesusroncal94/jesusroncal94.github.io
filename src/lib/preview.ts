export interface PreviewImage {
  path: string;
  alt: string;
}

export const PREVIEW_SIZE = { width: 1200, height: 630 } as const;

export const ogImagePath = (slug?: string) => (slug ? `/og/work/${slug}.jpg` : '/og/home.jpg');
