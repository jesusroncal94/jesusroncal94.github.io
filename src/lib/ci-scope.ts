const DOCUMENTATION_DIRECTORY = 'spdd/';
const DOCUMENTATION_FILES = new Set(['README.md', 'CLAUDE.md']);

const isDocumentation = (path: string) => path.startsWith(DOCUMENTATION_DIRECTORY) || DOCUMENTATION_FILES.has(path);

export function isDocumentationOnly(paths: readonly string[]): boolean {
  return paths.length > 0 && paths.every(isDocumentation);
}
