// Shapes for GET /organizations/:organizationId/patients/:patientId/purchase-limits.

export type PurchaseLimitPeriod = "MONTHLY" | "ANNUAL";

export type PurchaseLimitUnit = "GRAM" | "MILLILITER" | "UNIT";

export type PurchaseLimitItem = {
  productId: string;
  productName: string;
  unit: PurchaseLimitUnit;
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
