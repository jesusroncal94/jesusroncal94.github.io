import { formatPeriod } from '../i18n/format';
import type { Locale } from '../i18n/locales';
import type { Role } from './profile/schema';

export interface TimelineEntry {
  roleId: string;
  role: string;
  organisation: string;
  place: string;
  line: string;
  earlier: boolean;
}

export interface TimelineRow extends Omit<TimelineEntry, 'roleId'> {
  period: string;
  current: boolean;
}

export interface Timeline {
  rows: TimelineRow[];
  earlierPeriod: string;
}

export function buildTimeline(roles: Role[], entries: TimelineEntry[], locale: Locale): Timeline {
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const dated = entries.map(({ roleId, ...entry }) => {
    const role = roleById.get(roleId);
    if (!role) throw new Error(`Timeline entry has no role in the public profile: ${roleId}`);
    return { ...entry, start: role.start, end: role.end };
  });

  return {
    rows: dated.map(({ start, end, ...entry }) => ({
      ...entry,
      period: formatPeriod(start, end, locale),
      current: end === null,
    })),
    earlierPeriod: spanOf(dated.filter((entry) => entry.earlier), locale),
  };
}

function spanOf(periods: { start: string; end: string | null }[], locale: Locale): string {
  if (periods.length === 0) return '';
  const start = periods.map((period) => period.start).sort()[0];
  const ongoing = periods.some((period) => period.end === null);
  const end = ongoing ? null : periods.map((period) => period.end!).sort().at(-1)!;
  return formatPeriod(start, end, locale);
}
