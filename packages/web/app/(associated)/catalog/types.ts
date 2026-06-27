import type { Product, ProductCategory } from "@/app/organization/operacional/products/types";

// A catalog product mirrors the organization product contract (with a freshly
// signed cover image URL) — it's the same shape the org catalog screen uses.
export type CatalogProduct = Product;

// GET /organizations/:organizationId/patients/:patientId/catalog
export type CatalogResponse = {
  // Categories the patient has access to — drives the filter buttons.
  categories: ProductCategory[];
  products: CatalogProduct[];
};
