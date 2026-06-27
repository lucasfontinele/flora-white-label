import { describe, expect, it } from "vitest";
import {
  patientPrescriptionParamsSchema,
  prescriptionListParamsSchema,
  upsertPrescriptionBodySchema,
} from "./prescription-schemas.js";

const validItem = {
  scope: "PRODUCT",
  productId: "prod-1",
  allowedQuantity: 12,
  period: "ANNUAL",
} as const;

const validCategoryItem = {
  scope: "CATEGORY",
  category: "OIL",
  allowedQuantity: 12,
  period: "ANNUAL",
} as const;

describe("prescription schemas", () => {
  it("accepts list and patient params", () => {
    expect(prescriptionListParamsSchema.safeParse({ organizationId: "org-1" }).success).toBe(true);
    expect(
      patientPrescriptionParamsSchema.safeParse({ organizationId: "org-1", patientId: "pat-1" })
        .success,
    ).toBe(true);
  });

  it("coerces issuedAt from a date-only string and trims observations", () => {
    const result = upsertPrescriptionBodySchema.safeParse({
      issuedAt: "2026-06-26",
      observations: "  Receita MEMED  ",
      items: [validItem],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.issuedAt).toBeInstanceOf(Date);
      expect(result.data.issuedAt.toISOString().startsWith("2026-06-26")).toBe(true);
      expect(result.data.observations).toBe("Receita MEMED");
      expect(result.data.items).toHaveLength(1);
    }
  });

  it("accepts an empty items array and null/absent observations", () => {
    expect(
      upsertPrescriptionBodySchema.safeParse({
        issuedAt: "2026-06-26T23:59:00.000Z",
        observations: null,
        items: [],
      }).success,
    ).toBe(true);
    expect(
      upsertPrescriptionBodySchema.safeParse({ issuedAt: "2026-06-26", items: [] }).success,
    ).toBe(true);
  });

  it("rejects an invalid date, missing issuedAt/items, and extra fields", () => {
    expect(
      upsertPrescriptionBodySchema.safeParse({ issuedAt: "not-a-date", items: [] }).success,
    ).toBe(false);
    expect(upsertPrescriptionBodySchema.safeParse({ items: [] }).success).toBe(false);
    expect(upsertPrescriptionBodySchema.safeParse({ issuedAt: "2026-06-26" }).success).toBe(false);
    expect(
      upsertPrescriptionBodySchema.safeParse({ issuedAt: "2026-06-26", items: [], extra: 1 })
        .success,
    ).toBe(false);
  });

  it("accepts a category-scoped posology item", () => {
    expect(
      upsertPrescriptionBodySchema.safeParse({
        issuedAt: "2026-06-26",
        items: [validCategoryItem],
      }).success,
    ).toBe(true);
  });

  it("rejects a posology item whose scope and id/category do not match", () => {
    // PRODUCT scope without a productId.
    expect(
      upsertPrescriptionBodySchema.safeParse({
        issuedAt: "2026-06-26",
        items: [{ scope: "PRODUCT", allowedQuantity: 5, period: "ANNUAL" }],
      }).success,
    ).toBe(false);
    // CATEGORY scope without a category.
    expect(
      upsertPrescriptionBodySchema.safeParse({
        issuedAt: "2026-06-26",
        items: [{ scope: "CATEGORY", allowedQuantity: 5, period: "ANNUAL" }],
      }).success,
    ).toBe(false);
  });

  it("rejects posology items with invalid quantity or period", () => {
    expect(
      upsertPrescriptionBodySchema.safeParse({
        issuedAt: "2026-06-26",
        items: [{ scope: "PRODUCT", productId: "prod-1", allowedQuantity: 0, period: "ANNUAL" }],
      }).success,
    ).toBe(false);
    expect(
      upsertPrescriptionBodySchema.safeParse({
        issuedAt: "2026-06-26",
        items: [{ scope: "PRODUCT", productId: "prod-1", allowedQuantity: 5, period: "WEEKLY" }],
      }).success,
    ).toBe(false);
  });
});
