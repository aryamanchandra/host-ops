/**
 * Unit tests for UTM parsing + source inference. Run via `npm run test:utm`.
 */
import assert from 'assert';
import { parseUtmParams, inferSource } from '../utm';

function run() {
  const full = parseUtmParams(
    'https://blog.example.com/post?utm_source=twitter&utm_medium=social&utm_campaign=launch'
  );
  assert.strictEqual(full.utmSource, 'twitter');
  assert.strictEqual(full.utmMedium, 'social');
  assert.strictEqual(full.utmCampaign, 'launch');
  assert.strictEqual(full.utmTerm, undefined);

  const bareQs = parseUtmParams('?utm_source=newsletter&utm_content=cta');
  assert.strictEqual(bareQs.utmSource, 'newsletter');
  assert.strictEqual(bareQs.utmContent, 'cta');

  assert.deepStrictEqual(parseUtmParams(''), {});
  assert.deepStrictEqual(parseUtmParams('https://x.com/no-params'), {
    utmSource: undefined,
    utmMedium: undefined,
    utmCampaign: undefined,
    utmTerm: undefined,
    utmContent: undefined,
  });

  assert.strictEqual(inferSource('https://www.google.com/search?q=x'), 'google.com');
  assert.strictEqual(inferSource('https://t.co/abc'), 't.co');
  assert.strictEqual(inferSource(''), undefined);
  assert.strictEqual(inferSource('not a url'), undefined);

  console.log('utm tests: OK');
}

run();
process.exit(0);
