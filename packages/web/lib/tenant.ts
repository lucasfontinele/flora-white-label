import { headers } from "next/headers";
import { cache } from "react";
import { apiFetch } from "./http";
import { extractSlugFromHost } from "./tenant-slug";

export type TenantBranding = {
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
};

export type Tenant = {
  organizationId: string;
  slug: string;
  tradeName: string;
  branding: TenantBranding | null;
};

// Shape of GET /organizations/by-slug/:slug.
type PublicOrganization = {
  id: string;
  tradeName: string;
  slug: string;
  settings: TenantBranding | null;
};

/**
 * Resolves the current tenant from the request: reads the `x-org-slug` header
 * (set by the middleware) — falling back to parsing the Host — and looks the
 * organization up by slug. Returns `null` when there is no subdomain or the
 * slug is unknown, so callers can fall back gracefully. Memoized per request.
 */
export const getTenant = cache(async (): Promise<Tenant | null> => {
  const headerList = await headers();
  const slug = headerList.get("x-org-slug") ?? extractSlugFromHost(headerList.get("host"));

  if (!slug) return null;

  try {
    const organization = await apiFetch<PublicOrganization>(`/organizations/by-slug/${slug}`, {
      method: "GET",
      skipMasterHeaders: true,
    });

    return {
      organizationId: organization.id,
      slug: organization.slug,
      tradeName: organization.tradeName,
      branding: organization.settings,
    };
  } catch {
    return null;
  }
});
