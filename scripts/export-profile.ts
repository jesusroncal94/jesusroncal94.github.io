import { readFile, writeFile } from 'node:fs/promises';
import { parseProfile } from '../src/lib/profile/parse';

const profilePath = process.env.PROFILE_PATH ?? '/cv-manager/profile.md';
const outputPath = 'data/public-profile.json';

const profile = parseProfile(await readFile(profilePath, 'utf8'));
await writeFile(outputPath, `${JSON.stringify(profile, null, 2)}\n`);

console.log(`Exported ${profile.roles.length} roles to ${outputPath}`);
