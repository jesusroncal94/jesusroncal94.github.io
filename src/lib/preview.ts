export interface PreviewImage {
  path: string;
  alt: string;
}

export const PREVIEW_SIZE = { width: 1200, height: 630 } as const;

export const ogImagePath = (slug?: string) => (slug ? `/og/work/${slug}.jpg` : '/og/home.jpg');

export const versionPreviewUrls = (html: string, versions: ReadonlyMap<string, string>) =>
  html.replace(/(<meta property="og:image" content="[^"?]*?(\/og\/[^"?]+\.jpg))"/g, (tag, prefix: string, path: string) =>
    versions.has(path) ? `${prefix}?v=${versions.get(path)}"` : tag,
  );
