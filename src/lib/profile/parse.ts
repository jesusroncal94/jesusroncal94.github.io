import { publicProfileSchema, type PublicProfile, type Role } from './schema';

const ROLE_HEADING = /^(.+?) — (.+?) \((\d{4}(?:-\d{2})?) to (\d{4}(?:-\d{2})?|present)\)$/;

export function stripComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

export function section(markdown: string, path: string[]): string {
  const lines = markdown.split('\n');
  let start = 0;
  let end = lines.length;
  let level = 0;

  for (const title of path) {
    const index = lines.findIndex((line, i) => {
      if (i < start || i >= end) return false;
      const heading = parseHeading(line);
      return heading !== null && heading.level > level && heading.title === title;
    });
    if (index === -1) throw new Error(`Section not found: ${path.join(' / ')}`);

    level = parseHeading(lines[index])!.level;
    start = index + 1;
    const next = lines.findIndex((line, i) => i >= start && i < end && (parseHeading(line)?.level ?? Infinity) <= level);
    end = next === -1 ? end : next;
  }

  return lines.slice(start, end).join('\n');
}

export function parseContact(text: string): { city: string; contact: PublicProfile['contact'] } {
  const fields = bulletFields(text);
  return {
    city: withoutParentheticals(required(fields, 'Location')),
    contact: {
      email: required(fields, 'Email'),
      linkedin: required(fields, 'LinkedIn'),
      github: required(fields, 'GitHub'),
    },
  };
}

export function parseRoles(text: string): Role[] {
  return headingsOfLevel(text, 3).map((heading) => {
    const match = ROLE_HEADING.exec(heading);
    if (!match) throw new Error(`Unrecognised role heading: ${heading}`);

    const [, title, employer, start, end] = match;
    const [organisation, ...location] = employer.split(', ');
    return {
      id: slugify(withoutParentheticals(organisation)),
      title,
      organisation,
      location: location.length ? location.join(', ') : null,
      start,
      end: end === 'present' ? null : end,
    };
  });
}

export function parseEducation(text: string): PublicProfile['education'] {
  return bullets(text).map((line) => {
    const [degree, institution, year] = line.split(' — ');
    return { degree, institution, year: Number(year) };
  });
}

export function parseSkills(text: string): PublicProfile['skills'] {
  return [...bulletFields(text)].map(([group, list]) => ({ group, items: splitTopLevel(list) }));
}

export function parseLanguages(text: string): PublicProfile['languages'] {
  return bullets(text).map((line) => {
    const [name, level] = line.split(' — ');
    return { name, level };
  });
}

export function parseProfile(markdown: string): PublicProfile {
  const source = stripComments(markdown);
  const summary = section(source, ['Profile', 'Summary']);
  const [name, headline] = firstParagraphLine(summary).replace(/\.$/, '').split(' — ');

  return publicProfileSchema.parse({
    name,
    headline,
    ...parseContact(section(source, ['Profile', 'Summary', 'Contact'])),
    roles: parseRoles(section(source, ['Profile', 'Experience'])),
    education: parseEducation(section(source, ['Profile', 'Education'])),
    skills: parseSkills(section(source, ['Profile', 'Skills', 'Technical'])),
    languages: parseLanguages(section(source, ['Profile', 'Skills', 'Languages'])),
  });
}

function parseHeading(line: string): { level: number; title: string } | null {
  const match = /^(#{1,6}) (.+?)\s*$/.exec(line);
  return match ? { level: match[1].length, title: match[2] } : null;
}

function headingsOfLevel(text: string, level: number): string[] {
  return text
    .split('\n')
    .map(parseHeading)
    .filter((heading) => heading?.level === level)
    .map((heading) => heading!.title);
}

function bullets(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

function bulletFields(text: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of bullets(text)) {
    const separator = line.indexOf(': ');
    if (separator > 0) fields.set(line.slice(0, separator), line.slice(separator + 2).trim());
  }
  return fields;
}

function required(fields: Map<string, string>, key: string): string {
  const value = fields.get(key);
  if (!value) throw new Error(`Missing field: ${key}`);
  return value;
}

function firstParagraphLine(text: string): string {
  const line = text.split('\n').find((candidate) => candidate.trim() && !candidate.startsWith('#'));
  if (!line) throw new Error('Summary has no opening line');
  return line.trim();
}

function withoutParentheticals(value: string): string {
  return value.replace(/\s*\([^)]*\)/g, '').trim();
}

function splitTopLevel(list: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if ((char === ',' || char === ';') && depth === 0) {
      items.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  items.push(current.trim());
  return items.filter(Boolean);
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
