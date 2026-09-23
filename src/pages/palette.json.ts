import type { APIRoute } from 'astro';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { buildPaletteEntries } from '../lib/palette-entries';

export const GET: APIRoute = async () => Response.json(await buildPaletteEntries(DEFAULT_LOCALE));
