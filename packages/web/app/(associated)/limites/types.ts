// Shapes for GET /organizations/:organizationId/patients/:patientId/purchase-limits.

export type PurchaseLimitPeriod = "MONTHLY" | "ANNUAL";

export type PurchaseLimitUnit = "GRAM" | "MILLILITER" | "UNIT";

export type PurchaseLimitScope = "PRODUCT" | "CATEGORY";

export type PurchaseLimitItem = {
  scope: PurchaseLimitScope;
  productId: string | null;
  productName: string | null;
  category: string | null;
  unit: PurchaseLimitUnit | null;
  period: PurchaseLimitPeriod;
  allowedQuantity: number;
  used: number;
  remaining: number;
  notes: string | null;
};

export type PurchaseLimits = {
  hasPrescription: boolean;
  issuedAt: string | null;
  validUntil: string | null;
  isExpired: boolean;
  items: PurchaseLimitItem[];
};
