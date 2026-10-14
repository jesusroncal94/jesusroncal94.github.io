// Paths that never reach the built site: SPDD artefacts, the documentation and its diagrams, and
// the agents' skills. A change made only of these skips the Lighthouse jobs; the tests still run.
const DOCUMENTATION_DIRECTORIES = ['spdd/', 'docs/', '.claude/skills/'];
const DOCUMENTATION_FILES = new Set(['README.md', 'CLAUDE.md']);

const isDocumentation = (path: string) =>
  DOCUMENTATION_DIRECTORIES.some((directory) => path.startsWith(directory)) || DOCUMENTATION_FILES.has(path);

export function isDocumentationOnly(paths: readonly string[]): boolean {
  return paths.length > 0 && paths.every(isDocumentation);
}
