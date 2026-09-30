import { createHash } from 'node:crypto';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { preview } from 'astro';
import { chromium, type Browser } from 'playwright';
import { localePath, PUBLISHED_LOCALES } from '../src/i18n/locales';
import { cvFileName } from '../src/lib/cv';
import { PREVIEW_SIZE, versionPreviewUrls } from '../src/lib/preview';

const PORT = 4322;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const DIST = 'dist';
const OG = `${DIST}/og`;

async function renderCvs(browser: Browser) {
  for (const locale of PUBLISHED_LOCALES) {
    const page = await browser.newPage();
    await page.goto(`${ORIGIN}${localePath(locale, 'cv')}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const path = `${DIST}/cv/${cvFileName(locale)}`;
    await page.pdf({ path, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(`Rendered ${path}`);
  }
}

async function cardPages() {
  const entries = await readdir(OG, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.name === 'index.html')
    .map((entry) => entry.parentPath.replaceAll('\\', '/').slice(OG.length));
}

async function renderCards(browser: Browser) {
  const page = await browser.newPage({ viewport: PREVIEW_SIZE });
  for (const card of await cardPages()) {
    await page.goto(`${ORIGIN}/og${card}/`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    const overflow = await page.locator('[data-og-content]').evaluate((element) => element.scrollHeight - element.clientHeight);
    if (overflow > 0) throw new Error(`Preview card /og${card}/ overflows its content box by ${overflow}px`);
    const path = card ? `${OG}${card}.jpg` : `${OG}/home.jpg`;
    await page.screenshot({ path, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, ...PREVIEW_SIZE } });
    console.log(`Rendered ${path}`);
  }
  await page.close();
}

async function removeCardPages() {
  const entries = await readdir(OG, { recursive: true, withFileTypes: true });
  await Promise.all(entries.filter((entry) => entry.name === 'index.html').map((entry) => rm(`${entry.parentPath}/${entry.name}`)));
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => `${entry.parentPath}/${entry.name}`);
  for (const directory of directories.sort((a, b) => b.length - a.length)) {
    if ((await readdir(directory)).length === 0) await rm(directory, { recursive: true });
  }
}

async function versionPreviews() {
  const files = (await readdir(DIST, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/'));
  const versions = new Map<string, string>();
  for (const image of files.filter((file) => file.startsWith(`${OG}/`) && file.endsWith('.jpg'))) {
    const hash = createHash('sha256').update(await readFile(image)).digest('hex').slice(0, 8);
    versions.set(image.slice(DIST.length), hash);
  }
  for (const page of files.filter((file) => file.endsWith('.html'))) {
    const html = await readFile(page, 'utf8');
    const versioned = versionPreviewUrls(html, versions);
    if (versioned !== html) await writeFile(page, versioned);
  }
}

const server = await preview({ root: '.', logLevel: 'warn', server: { host: '127.0.0.1', port: PORT } });
const browser = await chromium.launch();

try {
  await renderCvs(browser);
  await renderCards(browser);
} finally {
  await browser.close();
  await server.stop();
}

await removeCardPages();
await versionPreviews();
