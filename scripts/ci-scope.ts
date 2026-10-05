import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { isDocumentationOnly } from '../src/lib/ci-scope';

const NO_COMMIT = /^0+$/;

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' });

function isInClone(commit: string): boolean {
  try {
    execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function changedPaths(base: string | undefined, head: string): string[] {
  if (!base || NO_COMMIT.test(base) || !isInClone(base)) return [];
  return git('diff', '--name-only', base, head).split('\n').filter(Boolean);
}

const paths = changedPaths(process.env.CI_BASE, process.env.GITHUB_SHA ?? 'HEAD');
const docsOnly = isDocumentationOnly(paths);

console.log(paths.length ? `Changed:\n  ${paths.join('\n  ')}` : 'No base to compare with: running every check');
console.log(`Documentation only: ${docsOnly}`);

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `docs_only=${docsOnly}\n`);
