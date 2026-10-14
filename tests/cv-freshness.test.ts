import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import profile from '../data/public-profile.json';
import { mergeCv, parseCv, parseProfile } from '../src/lib/profile/parse';

// cv-manager is private, and this repo's CI never gets access to it: the test service mounts it
// read-only on Jesus's machine, and in CI the check is reported as skipped rather than passed.
const CV_MANAGER = process.env.CV_MANAGER ?? '/cv-manager';
const sources = [`${CV_MANAGER}/profile.md`, `${CV_MANAGER}/cv-base.md`];
const available = sources.every((path) => existsSync(path));

describe('export freshness', () => {
  if (!available) console.warn(`Export freshness skipped: ${CV_MANAGER} is not available here.`);

  it.skipIf(!available)('matches a fresh parse of cv-manager', () => {
    const [profileSource, cvSource] = sources.map((path) => readFileSync(path, 'utf8'));
    const fresh = mergeCv(parseProfile(profileSource), parseCv(cvSource));
    expect(profile, 'data/public-profile.json is stale: run ./tasks.ps1 export').toEqual(fresh);
  });
});
