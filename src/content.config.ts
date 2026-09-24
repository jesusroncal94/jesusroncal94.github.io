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

const sectionHead = z.object({
  eyebrow: z.string(),
  title: z.string(),
  titleShort: z.string().optional(),
  lede: z.string().optional(),
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
    palette: z.object({
      placeholder: z.string(),
      hint: z.string(),
      questions: z.array(z.object({ label: z.string(), case: z.string() })),
    }),
    work: sectionHead.extend({ more: z.string() }),
    openSource: sectionHead.extend({
      repos: z.array(
        z.object({
          name: z.string(),
          url: z.url(),
          title: z.string(),
          pitch: z.string(),
          note: z.string(),
          stack: z.array(z.string()),
        }),
      ),
    }),
    experience: sectionHead.extend({
      entries: z.array(
        z.object({
          roleId: z.string(),
          role: z.string(),
          organisation: z.string(),
          place: z.string(),
          line: z.string(),
          earlier: z.boolean().default(false),
        }),
      ),
      earlierSummary: z.object({ role: z.string(), organisation: z.string() }),
    }),
    principles: sectionHead.extend({
      items: z.array(z.object({ numeral: z.string(), title: z.string(), body: z.string() })),
    }),
    contact: z.object({
      headlineLead: z.string(),
      headlineAccent: z.string(),
      lede: z.string(),
      ledeShort: z.string(),
      sourceUrl: z.url(),
    }),
    cv: z.object({
      summary: z.string(),
      highlights: z.array(z.object({ roleId: z.string(), items: z.array(z.string()).min(1).max(4) })),
    }),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    order: z.number().int().positive(),
    roleId: z.string(),
    organisation: z.string(),
    product: z.string().optional(),
    role: z.string(),
    title: z.string(),
    summary: z.string(),
    before: z.string(),
    after: z.string(),
    stack: z.array(z.string()).min(1),
    keywords: z.array(z.string()).default([]),
  }),
});

export const collections = { site, cases };
