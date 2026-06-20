/**
 * URL-safe organization slug, used to resolve a tenant from its subdomain
 * (e.g. "vida-verde" in `vida-verde.flora.app`). Lowercase, alphanumeric with
 * single hyphens between segments, no leading/trailing hyphen.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
