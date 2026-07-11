/**
 * Bounded, safe fetch of source files from a public GitHub repository so an
 * LLM can audit them. This runs on a public, token-spending demo, so every
 * bound here (file count, per-file bytes, total bytes, excluded paths) is
 * security-critical: it caps how much untrusted content ever reaches the model.
 *
 * Pure helpers (parse, filter, select) are kept side-effect free and unit
 * tested; fetchRepoFiles injects fetch so it can be tested without a network.
 */

/** Hard cap on how many files a single audit will ever pull. */
export const MAX_FILES = 12;
/** Largest single file we will read (bytes). */
export const MAX_FILE_BYTES = 20_000;
/** Cumulative byte budget across all selected files. */
export const MAX_TOTAL_BYTES = 150_000;

/** Source extensions worth auditing. Anything else is skipped outright. */
export const AUDITABLE_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'py',
  'go',
  'java',
  'rb',
  'php',
  'cs',
  'kt',
  'swift',
  'rs',
  'sol',
  'c',
  'cpp',
  'h',
]);

/** Directory segments that never contain first-party application source. */
const EXCLUDED_SEGMENTS = new Set([
  'node_modules',
  'vendor',
  'dist',
  'build',
  '.next',
  'out',
  'coverage',
  '__snapshots__',
  '.git',
  'test',
  'tests',
  '__tests__',
]);

/** Dependency lockfiles: large, generated, and useless to an auditor. */
const LOCKFILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);

/** GitHub's allowed charset for owner and repo names. */
const NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

const GITHUB_HEADERS = {
  'user-agent': 'mizan-auditor',
  accept: 'application/vnd.github+json',
} as const;

export interface RepoRef {
  owner: string;
  repo: string;
}

/**
 * Parses a public GitHub repo URL into its owner and repo. Accepts only
 * https://github.com/<owner>/<repo>, tolerating a trailing slash, a .git
 * suffix, or extra trailing path (e.g. /tree/main). Returns null for any
 * other host, scheme, shape, or an owner/repo outside GitHub's charset.
 */
export function parseRepoUrl(input: string): RepoRef | null {
  if (typeof input !== 'string' || input.trim().length === 0) return null;

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.hostname !== 'github.com') return null;

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  let repo = segments[1];
  if (repo.endsWith('.git')) repo = repo.slice(0, -4);

  if (!isValidName(owner) || !isValidName(repo)) return null;

  return { owner, repo };
}

function isValidName(name: string): boolean {
  return NAME_PATTERN.test(name) && !name.includes('..');
}

/**
 * True only when a path both has an auditable extension and lives in a
 * location worth auditing. Excludes vendored/build output, snapshots, minified
 * bundles, type declarations, lockfiles, and tests, preferring app source.
 */
export function isAuditablePath(path: string): boolean {
  if (typeof path !== 'string' || path.length === 0) return false;

  const segments = path.replace(/\\/g, '/').split('/').filter(Boolean);
  if (segments.length === 0) return false;

  for (const segment of segments) {
    if (EXCLUDED_SEGMENTS.has(segment)) return false;
  }

  const file = segments[segments.length - 1];

  if (LOCKFILES.has(file)) return false;
  if (/\.min\.js$/i.test(file)) return false;
  if (/\.d\.ts$/i.test(file)) return false;
  if (/\.(test|spec)\./i.test(file)) return false;

  return AUDITABLE_EXTENSIONS.has(extensionOf(file));
}

function extensionOf(file: string): string {
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return '';
  return file.slice(dot + 1).toLowerCase();
}

export interface TreeEntry {
  path: string;
  size: number;
  type: string;
}

/**
 * From a recursive git-tree listing, picks the auditable blobs to fetch:
 * each within the per-file byte cap, ordered deterministically (shallower
 * paths first, then alphabetical), up to MAX_FILES and MAX_TOTAL_BYTES.
 */
export function selectFiles(tree: TreeEntry[]): string[] {
  const candidates = tree
    .filter(entry => entry.type === 'blob')
    .filter(entry => typeof entry.size === 'number' && entry.size <= MAX_FILE_BYTES)
    .filter(entry => isAuditablePath(entry.path))
    .slice()
    .sort(comparePaths);

  const selected: string[] = [];
  let total = 0;

  for (const entry of candidates) {
    if (selected.length >= MAX_FILES) break;
    if (total + entry.size > MAX_TOTAL_BYTES) break;
    selected.push(entry.path);
    total += entry.size;
  }

  return selected;
}

function comparePaths(a: TreeEntry, b: TreeEntry): number {
  const depthA = a.path.split('/').length;
  const depthB = b.path.split('/').length;
  if (depthA !== depthB) return depthA - depthB;
  if (a.path < b.path) return -1;
  if (a.path > b.path) return 1;
  return 0;
}

export type RepoFetchError =
  'invalid_url' | 'not_found' | 'too_large' | 'rate_limited' | 'empty' | 'fetch_failed';

export type RepoFetchResult =
  | {
      ok: true;
      owner: string;
      repo: string;
      branch: string;
      files: { path: string; content: string }[];
    }
  | { ok: false; error: RepoFetchError };

export interface FetchRepoOptions {
  fetchImpl?: typeof fetch;
}

/**
 * Resolves a public GitHub repo URL to a bounded set of source files. Never
 * throws: every failure path maps to a RepoFetchResult error variant. The
 * fetch implementation is injectable so callers (and tests) can control it.
 */
export async function fetchRepoFiles(
  url: string,
  opts: FetchRepoOptions = {}
): Promise<RepoFetchResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;

  const ref = parseRepoUrl(url);
  if (!ref) return { ok: false, error: 'invalid_url' };
  const { owner, repo } = ref;

  const metaResult = await getJson(fetchImpl, `https://api.github.com/repos/${owner}/${repo}`);
  if (!metaResult.ok) return { ok: false, error: metaResult.error };

  const branch = readDefaultBranch(metaResult.body);
  if (!branch) return { ok: false, error: 'fetch_failed' };

  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
    branch
  )}?recursive=1`;
  const treeResult = await getJson(fetchImpl, treeUrl);
  if (!treeResult.ok) return { ok: false, error: treeResult.error };

  const selected = selectFiles(normalizeTree(treeResult.body));
  if (selected.length === 0) return { ok: false, error: 'empty' };

  const files = await readRawFiles(fetchImpl, owner, repo, branch, selected);
  if (files.length === 0) return { ok: false, error: 'empty' };

  return { ok: true, owner, repo, branch, files };
}

type JsonResult =
  { ok: true; body: unknown } | { ok: false; error: 'not_found' | 'rate_limited' | 'fetch_failed' };

/** GETs a GitHub API endpoint and classifies its failures uniformly. */
async function getJson(fetchImpl: typeof fetch, url: string): Promise<JsonResult> {
  let response: Response;
  try {
    response = await fetchImpl(url, { headers: { ...GITHUB_HEADERS } });
  } catch {
    return { ok: false, error: 'fetch_failed' };
  }

  if (response.status === 404) return { ok: false, error: 'not_found' };
  if (response.status === 403 && isRateLimited(response)) {
    return { ok: false, error: 'rate_limited' };
  }
  if (!response.ok) return { ok: false, error: 'fetch_failed' };

  try {
    return { ok: true, body: await response.json() };
  } catch {
    return { ok: false, error: 'fetch_failed' };
  }
}

function isRateLimited(response: Response): boolean {
  if (response.headers.get('x-ratelimit-remaining') === '0') return true;
  return response.headers.get('retry-after') !== null;
}

function readDefaultBranch(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const branch = (body as Record<string, unknown>).default_branch;
  return typeof branch === 'string' && branch.length > 0 ? branch : null;
}

function normalizeTree(body: unknown): TreeEntry[] {
  if (!body || typeof body !== 'object') return [];
  const raw = (body as Record<string, unknown>).tree;
  if (!Array.isArray(raw)) return [];

  const entries: TreeEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    if (typeof record.path !== 'string' || typeof record.type !== 'string') continue;
    const size = typeof record.size === 'number' ? record.size : 0;
    entries.push({ path: record.path, size, type: record.type });
  }
  return entries;
}

/** Reads each selected path from raw.githubusercontent, skipping failures. */
async function readRawFiles(
  fetchImpl: typeof fetch,
  owner: string,
  repo: string,
  branch: string,
  paths: string[]
): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];

  for (const path of paths) {
    try {
      const response = await fetchImpl(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
        { headers: { ...GITHUB_HEADERS } }
      );
      if (!response.ok) continue;
      const text = await response.text();
      files.push({ path, content: text.slice(0, MAX_FILE_BYTES) });
    } catch {
      continue;
    }
  }

  return files;
}
