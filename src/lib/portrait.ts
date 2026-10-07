import { getImage } from 'astro:assets';
import portrait from '../assets/portrait.jpg';

export const portraitImages = () =>
  Promise.all((['avif', 'webp'] as const).map((format) => getImage({ src: portrait, widths: [420, 840], format })));

// The widest WebP the hero serves; Astro caps the widths at the source's own (660 px).
export async function largestPortraitPath() {
  const [, webp] = await portraitImages();
  const largest = webp.srcSet.values.at(-1);
  if (!largest) throw new Error('The WebP portrait was not generated');
  return largest.url;
}
