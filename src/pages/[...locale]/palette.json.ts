import type { APIRoute } from 'astro';
import { localeRoutes, type Locale } from '../../i18n/locales';
import { buildPaletteEntries } from '../../lib/palette-entries';

export const getStaticPaths = localeRoutes;

export const GET: APIRoute<{ locale: Locale }> = async ({ props }) => Response.json(await buildPaletteEntries(props.locale));
