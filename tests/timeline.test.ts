import { describe, expect, it } from 'vitest';
import { buildTimeline } from '../src/lib/timeline';
import type { Role } from '../src/lib/profile/schema';

const roles: Role[] = [
  { id: 'intercorp', title: 'AI Engineer', organisation: 'Intercorp', location: null, start: '2024-09', end: null },
  { id: 'rcp', title: 'Backend Developer', organisation: 'RCP', location: null, start: '2020-07', end: '2022-01' },
  { id: 'codrise', title: 'Software Engineer', organisation: 'Codrise', location: null, start: '2017-12', end: '2020-07' },
];

describe('buildTimeline', () => {
  it('dates editorial entries from the public profile', () => {
    const entry = (roleId: string, earlier = false) => ({ roleId, role: roleId, organisation: roleId, place: 'Lima', line: '', earlier });
    const timeline = buildTimeline(roles, [entry('intercorp'), entry('rcp', true), entry('codrise', true)], 'en');

    expect(timeline.rows.map(({ period, current }) => [period, current])).toEqual([
      ['2024 — now', true],
      ['2020 — 2022', false],
      ['2017 — 2020', false],
    ]);
    expect(timeline.earlierPeriod).toBe('2017 — 2022');
  });
});
