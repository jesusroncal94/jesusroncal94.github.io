import { z } from 'zod';

const yearOrMonth = z.string().regex(/^\d{4}(-\d{2})?$/);

export const roleSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1),
    organisation: z.string().min(1),
    location: z.string().min(1).nullable(),
    start: yearOrMonth,
    end: yearOrMonth.nullable(),
  })
  .strict();

export const publicProfileSchema = z
  .object({
    name: z.string().min(1),
    headline: z.string().min(1),
    city: z.string().min(1),
    contact: z
      .object({
        email: z.email(),
        linkedin: z.url(),
        github: z.url(),
      })
      .strict(),
    roles: z.array(roleSchema).min(1),
    education: z.array(
      z.object({ degree: z.string().min(1), institution: z.string().min(1), year: z.number().int() }).strict(),
    ),
    skills: z.array(z.object({ group: z.string().min(1), items: z.array(z.string().min(1)).min(1) }).strict()),
    languages: z.array(z.object({ name: z.string().min(1), level: z.string().min(1) }).strict()),
  })
  .strict();

export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type Role = z.infer<typeof roleSchema>;
