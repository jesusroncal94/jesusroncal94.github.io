import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const metric = z.object({
  value: z.string(),
  caption: z.string(),
  source: z.string(),
  compact: z.object({ value: z.string(), caption: z.string() }).optional(),
  accent: z.boolean().default(false),
});

const site = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/site' }),
  schema: z.object({
    displayName: z.string(),
    monogram: z.string(),
    hero: z.object({
      status: z.string(),
      headlineLead: z.string(),
      headlineAccent: z.string(),
      lede: z.string(),
      ledeShort: z.string(),
      role: z.string(),
      portraitAlt: z.string(),
      portraitCaption: z.string(),
      badges: z.array(z.object({ eyebrow: z.string(), title: z.string() })).length(2),
    }),
    metrics: z.array(metric).min(3),
  }),
});

export const collections = { site };
