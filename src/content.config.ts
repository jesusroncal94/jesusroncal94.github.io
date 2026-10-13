import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { amountOf, GRID, HOURGLASS_PARTS, hourglassOf, leadingCount, percentOf } from './lib/mechanism';

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
    privacy: z.object({
      eyebrow: z.string(),
      title: z.string(),
      updated: z.iso.date(),
      sections: z.array(z.object({ heading: z.string(), text: z.string() })).min(1),
    }),
    cv: z.object({
      summary: z.string(),
      highlights: z.array(z.object({ roleId: z.string(), items: z.array(z.string()).min(1).max(4) })),
    }),
  }),
});

const mechanism = z.object({
  label: z.string(),
  stages: z
    .array(
      z.object({
        glyph: z.enum(['queue', 'lanes', 'gate', 'done', 'version', 'fixtures', 'rubric', 'compare', 'ledger', 'trace', 'worker', 'drop', ...HOURGLASS_PARTS]),
        label: z.string(),
        detail: z.string(),
        sentence: z.string(),
      }),
    )
    .min(2)
    .max(6),
});

const DOTS = GRID.columns * GRID.rows;

const cases = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cases' }),
  schema: z
    .object({
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
      mechanism: mechanism.optional(),
    })
    // Every number a glyph draws comes from the case's own copy; a case that cannot supply it fails.
    .superRefine(({ mechanism, before, after }, context) => {
      const [spent, left] = [amountOf(before), amountOf(after)];
      for (const { glyph, detail } of mechanism?.stages ?? []) {
        if ((glyph === 'queue' || glyph === 'done') && leadingCount(before) !== DOTS)
          context.addIssue({ code: 'custom', message: `A ${glyph} glyph draws ${DOTS} dots; the case's "before" must state ${DOTS}.` });
        if (glyph === 'rubric' && leadingCount(detail) === undefined)
          context.addIssue({ code: 'custom', message: `A rubric glyph draws one tick per item; its detail must state how many: "${detail}".` });
        if (glyph === 'compare' && (percentOf(before) === undefined || percentOf(after) === undefined))
          context.addIssue({ code: 'custom', message: `A compare glyph draws the case's percentages; "${before}" and "${after}" must both be percentages.` });
        if (glyph === 'drop' && !(spent !== undefined && left !== undefined && spent > 0 && left < spent))
          context.addIssue({ code: 'custom', message: `A drop glyph draws the case's amounts; "${before}" and "${after}" must be amounts, the second below the first.` });
      }
      const stages = mechanism?.stages ?? [];
      const parts = HOURGLASS_PARTS.map((part) => stages.filter(({ glyph }) => glyph === part).length);
      if (parts.some((count) => count > 0) && (parts.some((count) => count !== 1) || !hourglassOf(stages)))
        context.addIssue({ code: 'custom', message: `The hourglass glyphs draw one shape: ${HOURGLASS_PARTS.join(', ')} once each, and the channels, inbound and outbound details must each state a count.` });
    }),
});

export const collections = { site, cases };
