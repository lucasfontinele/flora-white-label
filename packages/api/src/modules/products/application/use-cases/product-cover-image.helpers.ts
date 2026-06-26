/**
 * Builds a stable, collision-free R2 object key for a product cover image.
 * Keys are namespaced by organization and product so a single bucket can be
 * shared with other modules (e.g. patient documents) without overlap.
 */
export function buildProductCoverImageStorageKey(input: {
  organizationId: string;
  productId: string;
  fileName: string;
  timestamp: number;
}): string {
  return [
    "organizations",
    input.organizationId,
    "products",
    input.productId,
    "cover-images",
    `${input.timestamp}-${safeFileName(input.fileName)}`,
  ].join("/");
}

function safeFileName(fileName: string): string {
  const normalized = fileName
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return normalized.length > 0 ? normalized : "cover-image";
}
