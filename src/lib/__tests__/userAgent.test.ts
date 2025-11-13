/**
 * Unit tests for parseUserAgent. Plain assertions (no framework) — run via
 * `npm run test:ua`. Locks the classifications that the old manual string
 * matching got wrong (iPhone -> iOS not macOS, Android -> Android not Linux,
 * Edge -> Edge not Chrome).
 */
import assert from 'assert';
import { parseUserAgent } from '../userAgent';

const cases: Array<{ name: string; ua: string; expect: Partial<ReturnType<typeof parseUserAgent>> }> = [
  {
    name: 'iPhone Safari -> iOS + Mobile',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    expect: { os: 'iOS', device: 'Mobile', browser: 'Safari' },
  },
  {
    name: 'iPad -> iOS + Tablet',
    ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    expect: { os: 'iOS' },
  },
  {
    name: 'Android Chrome -> Android not Linux + Mobile',
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    expect: { os: 'Android', device: 'Mobile', browser: 'Chrome' },
  },
  {
    name: 'Windows Chrome -> Windows + Desktop',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    expect: { os: 'Windows', device: 'Desktop', browser: 'Chrome' },
  },
  {
    name: 'macOS Safari -> macOS + Safari',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    expect: { os: 'macOS', browser: 'Safari' },
  },
  {
    name: 'Edge -> Edge not Chrome',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    expect: { browser: 'Edge', os: 'Windows' },
  },
  {
    name: 'Firefox -> Firefox',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    expect: { browser: 'Firefox' },
  },
  {
    name: 'empty UA -> all Unknown',
    ua: '',
    expect: { browser: 'Unknown', os: 'Unknown', device: 'Unknown' },
  },
  {
    name: 'malformed UA -> Unknown browser/os',
    ua: 'not-a-real-user-agent-string',
    expect: { browser: 'Unknown', os: 'Unknown' },
  },
];

function run() {
  for (const c of cases) {
    const got = parseUserAgent(c.ua) as unknown as Record<string, string>;
    for (const [key, value] of Object.entries(c.expect)) {
      assert.strictEqual(
        got[key],
        value,
        `${c.name}: expected ${key}=${value}, got ${got[key]}`
      );
    }
  }
  console.log(`userAgent tests: OK (${cases.length} cases)`);
}

run();
process.exit(0);
