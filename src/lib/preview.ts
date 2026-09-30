import { localePath, type Locale } from '../i18n/locales';

export interface PreviewImage {
  path: string;
  alt: string;
}

export const PREVIEW_SIZE = { width: 1200, height: 630 } as const;

export const ogImagePath = (locale: Locale, slug?: string) => `${localePath(locale, 'og')}${slug ? `work/${slug}` : 'home'}.jpg`;

export const versionPreviewUrls = (html: string, versions: ReadonlyMap<string, string>) =>
  html.replace(/(<meta property="og:image" content="https?:\/\/[^/"]+(\/[^"?]*\/og\/[^"?]+\.jpg|\/og\/[^"?]+\.jpg))"/g, (tag, prefix: string, path: string) =>
    versions.has(path) ? `${prefix}?v=${versions.get(path)}"` : tag,
  );
