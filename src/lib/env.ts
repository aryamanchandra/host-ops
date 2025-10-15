/**
 * Centralized environment variable access with fail-fast validation.
 * Import `requireEnv` for values that must be present, or `optionalEnv`
 * for ones with safe fallbacks. Missing required vars throw at call time
 * so misconfiguration surfaces immediately instead of as silent bugs.
 */

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ROOT_DOMAIN',
  'NEXT_PUBLIC_ROOT_DOMAIN',
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

export function requireEnv(name: RequiredVar | string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function optionalEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

/**
 * Validate that all baseline required vars are present. Call from server
 * startup / setup scripts to fail fast on a misconfigured deployment.
 */
export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
