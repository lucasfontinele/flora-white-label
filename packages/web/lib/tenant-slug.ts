// Pure helper (no server/edge-only imports) so it can run in both the Next
// middleware (Edge) and server components. Extracts the tenant slug from the
// request Host, e.g. "vida-verde.flora.app" -> "vida-verde".

const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "auth"]);

function getRootDomain(): string {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost").toLowerCase();
}

export function extractSlugFromHost(host?: string | null): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0]?.trim().toLowerCase() ?? "";
  const rootDomain = getRootDomain();

  // Apex (flora.app / localhost) carries no tenant.
  if (!hostname || hostname === rootDomain) return null;

  const suffix = `.${rootDomain}`;
  if (!hostname.endsWith(suffix)) return null;

  // Leftmost label is the slug ("a.b.flora.app" -> "a").
  const slug = hostname.slice(0, hostname.length - suffix.length).split(".")[0];

  if (!slug || RESERVED_SUBDOMAINS.has(slug)) return null;

  return slug;
}
