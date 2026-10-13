import { readFile, writeFile } from 'node:fs/promises';
import { mergeCv, parseCv, parseProfile } from '../src/lib/profile/parse';

const profilePath = process.env.PROFILE_PATH ?? '/cv-manager/profile.md';
const cvPath = process.env.CV_PATH ?? '/cv-manager/cv-base.md';
const outputPath = 'data/public-profile.json';

const profile = mergeCv(parseProfile(await readFile(profilePath, 'utf8')), parseCv(await readFile(cvPath, 'utf8')));
await writeFile(outputPath, `${JSON.stringify(profile, null, 2)}\n`);

const bullets = profile.roles.reduce((total, role) => total + (role.bullets?.length ?? 0), 0);
console.log(`Exported ${profile.roles.length} roles, the CV summary and ${bullets} bullets to ${outputPath}`);
