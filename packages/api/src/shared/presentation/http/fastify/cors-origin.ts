export interface CorsOriginOptions {
  /** Base domains whose subdomains (and apex) are allowed, on any port. */
  domains: string[];
  /** Exact origin strings that are always allowed. */
  exactOrigins?: string[];
}

/**
 * Decides whether a browser Origin is allowed.
 *
 * Matching is by hostname, so every subdomain of a configured base domain is
 * accepted regardless of port or protocol (e.g. base "localhost" allows
 * `http://ise.localhost:3000`; base "flora.app" allows `https://ise.flora.app`).
 * Requests without an Origin header (server-to-server, curl, same-origin) are
 * allowed.
 */
export function isOriginAllowed(origin: string | undefined, options: CorsOriginOptions): boolean {
  if (!origin) return true;

  if (options.exactOrigins?.includes(origin)) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return false;
  }

  return options.domains.some((domain) => {
    const base = domain.toLowerCase();
    return hostname === base || hostname.endsWith(`.${base}`);
  });
}

type OriginDelegateCallback = (error: Error | null, allow: boolean) => void;

/**
 * Builds the `origin` delegate for `@fastify/cors`. Returning `true` makes the
 * plugin reflect the request Origin, which is required when `credentials` is on
 * (the wildcard `*` is not allowed with credentials).
 */
export function createCorsOriginDelegate(options: CorsOriginOptions) {
  return (origin: string | undefined, callback: OriginDelegateCallback): void => {
    callback(null, isOriginAllowed(origin, options));
  };
}
