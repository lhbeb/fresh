const DEFAULT_BASE_URL = 'https://happydeel.com';

const ENV_BASE_URL_CANDIDATES: Array<string | null | undefined> = [
  process.env.APP_BASE_URL,
  process.env.NEXT_PUBLIC_BASE_URL,
  process.env.BASE_URL,
  process.env.SITE_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
];

/**
 * Normalize a base URL string to ensure it includes protocol and excludes trailing slash.
 */
export function normalizeBaseUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') {
    return null;
  }

  try {
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const url = new URL(hasProtocol ? trimmed : `https://${trimmed}`);
    return url.origin.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/**
 * Resolves the preferred base URL by checking custom candidates first,
 * then falling back to known environment variables, and finally a default domain.
 */
export function resolveBaseUrl(
  candidates: Array<string | null | undefined> = [],
  fallback: string = DEFAULT_BASE_URL,
): string {
  for (const candidate of [...candidates, ...ENV_BASE_URL_CANDIDATES]) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return fallback;
}

export { DEFAULT_BASE_URL };

