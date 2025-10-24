/**
 * Smoke test for the JWT auth layer that every protected API route depends on.
 * No test framework — plain assertions, run via `npm run test:smoke`.
 */
import assert from 'assert';
import { generateToken, verifyToken } from '../src/lib/auth';

// Importing the auth module pulls in the Mongo client (eager connect side
// effect). This smoke test exercises only the JWT layer, so ignore any
// background connection failure from the unused DB handle.
process.on('unhandledRejection', () => {});

function run() {
  // Round-trip: a signed token verifies back to its payload.
  const token = generateToken({ userId: 'u123', username: 'alice' });
  assert.ok(typeof token === 'string' && token.length > 0, 'token should be generated');

  const decoded = verifyToken(token);
  assert.ok(decoded, 'valid token should verify');
  assert.strictEqual(decoded.userId, 'u123', 'userId should round-trip');
  assert.strictEqual(decoded.username, 'alice', 'username should round-trip');

  // Rejection: malformed and tampered tokens must not verify.
  assert.strictEqual(verifyToken('not-a-real-token'), null, 'garbage should be rejected');
  assert.strictEqual(verifyToken(token + 'tampered'), null, 'tampered token should be rejected');

  console.log('auth smoke: OK');
}

run();
process.exit(0);
