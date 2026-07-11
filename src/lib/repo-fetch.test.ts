import { describe, expect, it } from 'vitest';
import {
  AUDITABLE_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  fetchRepoFiles,
  isAuditablePath,
  parseRepoUrl,
  selectFiles,
  type TreeEntry,
} from '@/lib/repo-fetch';

describe('parseRepoUrl', () => {
  it('accepts a plain https github repo url', () => {
    expect(parseRepoUrl('https://github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('tolerates a trailing slash', () => {
    expect(parseRepoUrl('https://github.com/facebook/react/')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('strips a .git suffix', () => {
    expect(parseRepoUrl('https://github.com/facebook/react.git')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('ignores extra trailing path like /tree/main', () => {
    expect(parseRepoUrl('https://github.com/facebook/react/tree/main')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('keeps dots, dashes, and underscores in names', () => {
    expect(parseRepoUrl('https://github.com/my-org/repo_name.js')).toEqual({
      owner: 'my-org',
      repo: 'repo_name.js',
    });
  });

  it('rejects a non-github host', () => {
    expect(parseRepoUrl('https://gitlab.com/facebook/react')).toBeNull();
  });

  it('rejects a subdomain of github', () => {
    expect(parseRepoUrl('https://raw.github.com/facebook/react')).toBeNull();
  });

  it('rejects a non-https scheme', () => {
    expect(parseRepoUrl('http://github.com/facebook/react')).toBeNull();
  });

  it('rejects a javascript: scheme injection', () => {
    expect(parseRepoUrl('javascript:alert(1)//github.com/a/b')).toBeNull();
  });

  it('rejects a path-traversal owner or repo', () => {
    expect(parseRepoUrl('https://github.com/o..o/react')).toBeNull();
    expect(parseRepoUrl('https://github.com/facebook/r..t')).toBeNull();
  });

  it('rejects a url missing the repo segment', () => {
    expect(parseRepoUrl('https://github.com/facebook')).toBeNull();
  });

  it('rejects non-string and empty input', () => {
    expect(parseRepoUrl('')).toBeNull();
    expect(parseRepoUrl('   ')).toBeNull();
    expect(parseRepoUrl('not a url')).toBeNull();
  });
});

describe('isAuditablePath', () => {
  it('accepts application source files', () => {
    expect(isAuditablePath('src/lib/repo-fetch.ts')).toBe(true);
    expect(isAuditablePath('main.py')).toBe(true);
    expect(isAuditablePath('pkg/server/handler.go')).toBe(true);
  });

  it('rejects files inside node_modules and other vendored dirs', () => {
    expect(isAuditablePath('node_modules/react/index.js')).toBe(false);
    expect(isAuditablePath('vendor/pkg/main.go')).toBe(false);
    expect(isAuditablePath('dist/bundle.js')).toBe(false);
    expect(isAuditablePath('.next/static/chunk.js')).toBe(false);
    expect(isAuditablePath('coverage/lcov-report/app.js')).toBe(false);
  });

  it('rejects minified bundles', () => {
    expect(isAuditablePath('public/vendor.min.js')).toBe(false);
  });

  it('rejects type declaration files', () => {
    expect(isAuditablePath('types/global.d.ts')).toBe(false);
  });

  it('rejects lockfiles', () => {
    expect(isAuditablePath('package-lock.json')).toBe(false);
    expect(isAuditablePath('yarn.lock')).toBe(false);
    expect(isAuditablePath('pnpm-lock.yaml')).toBe(false);
  });

  it('rejects test and spec files', () => {
    expect(isAuditablePath('src/lib/repo-fetch.test.ts')).toBe(false);
    expect(isAuditablePath('src/lib/repo-fetch.spec.ts')).toBe(false);
    expect(isAuditablePath('tests/unit/thing.ts')).toBe(false);
    expect(isAuditablePath('src/__tests__/thing.ts')).toBe(false);
  });

  it('rejects non-code files', () => {
    expect(isAuditablePath('README.md')).toBe(false);
    expect(isAuditablePath('config.yaml')).toBe(false);
    expect(isAuditablePath('.gitignore')).toBe(false);
    expect(isAuditablePath('LICENSE')).toBe(false);
  });
});

describe('selectFiles', () => {
  it('keeps only auditable blobs', () => {
    const tree: TreeEntry[] = [
      { path: 'src/a.ts', size: 100, type: 'blob' },
      { path: 'src', size: 0, type: 'tree' },
      { path: 'node_modules/x/index.js', size: 100, type: 'blob' },
      { path: 'README.md', size: 100, type: 'blob' },
    ];
    expect(selectFiles(tree)).toEqual(['src/a.ts']);
  });

  it('skips any single file larger than MAX_FILE_BYTES', () => {
    const tree: TreeEntry[] = [
      { path: 'big.ts', size: MAX_FILE_BYTES + 1, type: 'blob' },
      { path: 'ok.ts', size: MAX_FILE_BYTES, type: 'blob' },
    ];
    expect(selectFiles(tree)).toEqual(['ok.ts']);
  });

  it('caps the count at MAX_FILES', () => {
    const tree: TreeEntry[] = Array.from({ length: MAX_FILES + 5 }, (_, i) => ({
      path: `f${String(i).padStart(3, '0')}.ts`,
      size: 10,
      type: 'blob',
    }));
    expect(selectFiles(tree)).toHaveLength(MAX_FILES);
  });

  it('stops once the cumulative byte budget would be exceeded', () => {
    const tree: TreeEntry[] = [
      { path: 'a.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'b.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'c.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'd.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'e.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'f.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'g.ts', size: MAX_FILE_BYTES, type: 'blob' },
      { path: 'h.ts', size: MAX_FILE_BYTES, type: 'blob' },
    ];
    const selected = selectFiles(tree);
    // 20_000 * 7 = 140_000 <= 150_000, an 8th would reach 160_000.
    expect(selected).toHaveLength(Math.floor(MAX_TOTAL_BYTES / MAX_FILE_BYTES));
    expect(selected.length * MAX_FILE_BYTES).toBeLessThanOrEqual(MAX_TOTAL_BYTES);
  });

  it('orders shallower paths first, then alphabetically', () => {
    const tree: TreeEntry[] = [
      { path: 'src/z/deep.ts', size: 10, type: 'blob' },
      { path: 'b.ts', size: 10, type: 'blob' },
      { path: 'a.ts', size: 10, type: 'blob' },
      { path: 'src/a.ts', size: 10, type: 'blob' },
    ];
    expect(selectFiles(tree)).toEqual(['a.ts', 'b.ts', 'src/a.ts', 'src/z/deep.ts']);
  });
});

describe('constants', () => {
  it('exposes the documented bounds', () => {
    expect(MAX_FILES).toBe(12);
    expect(MAX_FILE_BYTES).toBe(20_000);
    expect(MAX_TOTAL_BYTES).toBe(150_000);
    expect(AUDITABLE_EXTENSIONS.has('ts')).toBe(true);
    expect(AUDITABLE_EXTENSIONS.has('rs')).toBe(true);
    expect(AUDITABLE_EXTENSIONS.has('md')).toBe(false);
  });
});

interface MockResponseInit {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
}

function mockResponse(init: MockResponseInit): Response {
  const status = init.status ?? 200;
  const headers = init.headers ?? {};
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
    json: async () => init.json,
    text: async () => init.text ?? '',
  } as unknown as Response;
}

/** Routes requests by URL substring so a test can script the whole flow. */
function routedFetch(routes: { match: string; response: Response }[]): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const route = routes.find(r => url.includes(r.match));
    if (!route) throw new Error(`no mock route for ${url}`);
    return route.response;
  }) as unknown as typeof fetch;
}

describe('fetchRepoFiles', () => {
  it('returns invalid_url without touching the network', async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return mockResponse({});
    }) as unknown as typeof fetch;

    const result = await fetchRepoFiles('https://gitlab.com/a/b', { fetchImpl });
    expect(result).toEqual({ ok: false, error: 'invalid_url' });
    expect(called).toBe(false);
  });

  it('resolves the default branch, selects files, and reads their content', async () => {
    const fetchImpl = routedFetch([
      {
        match: 'api.github.com/repos/acme/widget/git/trees',
        response: mockResponse({
          json: {
            tree: [
              { path: 'src/index.ts', size: 120, type: 'blob' },
              { path: 'src/util.ts', size: 80, type: 'blob' },
              { path: 'node_modules/dep/index.js', size: 50, type: 'blob' },
              { path: 'README.md', size: 40, type: 'blob' },
            ],
          },
        }),
      },
      {
        match: 'api.github.com/repos/acme/widget',
        response: mockResponse({ json: { default_branch: 'main' } }),
      },
      {
        match: 'raw.githubusercontent.com/acme/widget/main/src/index.ts',
        response: mockResponse({ text: 'export const a = 1;' }),
      },
      {
        match: 'raw.githubusercontent.com/acme/widget/main/src/util.ts',
        response: mockResponse({ text: 'export const b = 2;' }),
      },
    ]);

    const result = await fetchRepoFiles('https://github.com/acme/widget', { fetchImpl });
    expect(result).toEqual({
      ok: true,
      owner: 'acme',
      repo: 'widget',
      branch: 'main',
      files: [
        { path: 'src/index.ts', content: 'export const a = 1;' },
        { path: 'src/util.ts', content: 'export const b = 2;' },
      ],
    });
  });

  it('returns not_found when the repo metadata is a 404', async () => {
    const fetchImpl = routedFetch([
      {
        match: 'api.github.com/repos/acme/missing',
        response: mockResponse({ status: 404, json: { message: 'Not Found' } }),
      },
    ]);

    const result = await fetchRepoFiles('https://github.com/acme/missing', { fetchImpl });
    expect(result).toEqual({ ok: false, error: 'not_found' });
  });

  it('returns rate_limited on a 403 with exhausted rate-limit headers', async () => {
    const fetchImpl = routedFetch([
      {
        match: 'api.github.com/repos/acme/widget',
        response: mockResponse({
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' },
          json: { message: 'rate limited' },
        }),
      },
    ]);

    const result = await fetchRepoFiles('https://github.com/acme/widget', { fetchImpl });
    expect(result).toEqual({ ok: false, error: 'rate_limited' });
  });

  it('returns empty when no auditable files are present', async () => {
    const fetchImpl = routedFetch([
      {
        match: 'api.github.com/repos/acme/docs/git/trees',
        response: mockResponse({
          json: {
            tree: [
              { path: 'README.md', size: 40, type: 'blob' },
              { path: 'docs/guide.md', size: 60, type: 'blob' },
            ],
          },
        }),
      },
      {
        match: 'api.github.com/repos/acme/docs',
        response: mockResponse({ json: { default_branch: 'main' } }),
      },
    ]);

    const result = await fetchRepoFiles('https://github.com/acme/docs', { fetchImpl });
    expect(result).toEqual({ ok: false, error: 'empty' });
  });

  it('returns fetch_failed when the network throws', async () => {
    const fetchImpl = (async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const result = await fetchRepoFiles('https://github.com/acme/widget', { fetchImpl });
    expect(result).toEqual({ ok: false, error: 'fetch_failed' });
  });

  it('skips a raw file that fails to download', async () => {
    const fetchImpl = routedFetch([
      {
        match: 'api.github.com/repos/acme/widget/git/trees',
        response: mockResponse({
          json: {
            tree: [
              { path: 'src/index.ts', size: 120, type: 'blob' },
              { path: 'src/util.ts', size: 80, type: 'blob' },
            ],
          },
        }),
      },
      {
        match: 'api.github.com/repos/acme/widget',
        response: mockResponse({ json: { default_branch: 'main' } }),
      },
      {
        match: 'raw.githubusercontent.com/acme/widget/main/src/index.ts',
        response: mockResponse({ status: 500, text: '' }),
      },
      {
        match: 'raw.githubusercontent.com/acme/widget/main/src/util.ts',
        response: mockResponse({ text: 'export const b = 2;' }),
      },
    ]);

    const result = await fetchRepoFiles('https://github.com/acme/widget', { fetchImpl });
    expect(result).toEqual({
      ok: true,
      owner: 'acme',
      repo: 'widget',
      branch: 'main',
      files: [{ path: 'src/util.ts', content: 'export const b = 2;' }],
    });
  });
});
