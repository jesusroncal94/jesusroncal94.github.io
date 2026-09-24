import { preview } from 'astro';
import { chromium } from 'playwright';
import { localePath, PUBLISHED_LOCALES } from '../src/i18n/locales';
import { cvFileName } from '../src/lib/cv';

const PORT = 4322;

const server = await preview({ root: '.', logLevel: 'warn', server: { host: '127.0.0.1', port: PORT } });
const browser = await chromium.launch();

try {
  for (const locale of PUBLISHED_LOCALES) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${localePath(locale, 'cv')}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const path = `dist/cv/${cvFileName(locale)}`;
    await page.pdf({ path, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`Rendered ${path}`);
  }
} finally {
  await browser.close();
  await server.stop();
}
