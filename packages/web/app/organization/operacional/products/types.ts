// Shapes and enums for the /organizations/:organizationId/products endpoints.
// Mirrors the API Product contract (see specs/010-organization-product-crud).

export const PRODUCT_CATEGORIES = [
  "FLOWER",
  "OIL",
  "EXTRACT",
  "CAPSULE",
  "EDIBLE",
  "TOPICAL",
  "VAPORIZER",
  "ACCESSORY",
  "OTHER",
] as const;

export const PRODUCT_TYPES = [
  "CBD",
  "THC",
  "BALANCED",
  "FULL_SPECTRUM",
  "BROAD_SPECTRUM",
  "ISOLATE",
] as const;

export const STRAIN_TYPES = ["INDICA", "SATIVA", "HYBRID"] as const;

export const PRODUCT_UNITS = ["GRAM", "MILLILITER", "UNIT"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductType = (typeof PRODUCT_TYPES)[number];
export type StrainType = (typeof STRAIN_TYPES)[number];
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

// Portuguese labels used to render the enum fields as selectable lists.
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  FLOWER: "Flor",
  OIL: "Óleo",
  EXTRACT: "Extrato",
  CAPSULE: "Cápsula",
  EDIBLE: "Comestível",
  TOPICAL: "Tópico",
  VAPORIZER: "Vaporizador",
  ACCESSORY: "Acessório",
  OTHER: "Outro",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  CBD: "CBD",
  THC: "THC",
  BALANCED: "Balanceado",
  FULL_SPECTRUM: "Full Spectrum",
  BROAD_SPECTRUM: "Broad Spectrum",
  ISOLATE: "Isolado",
};

export const STRAIN_TYPE_LABELS: Record<StrainType, string> = {
  INDICA: "Índica",
  SATIVA: "Sativa",
  HYBRID: "Híbrida",
};

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  GRAM: "Grama (g)",
  MILLILITER: "Mililitro (ml)",
  UNIT: "Unidade",
};

export type Product = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  type: ProductType;
  strainType: StrainType | null;
  thcPercentage: number | null;
  cbdPercentage: number | null;
  unit: ProductUnit;
  priceInCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/products
export type ListProductsResponse = {
  data: Product[];
};

// Body for POST and PUT /organizations/:organizationId/products[/:id]
export type ProductWriteBody = {
  name: string;
  description: string | null;
  category: ProductCategory;
  type: ProductType;
  strainType: StrainType | null;
  thcPercentage: number | null;
  cbdPercentage: number | null;
  unit: ProductUnit;
  priceInCents: number;
};
