import { describe, expect, it } from "vitest";
import {
  adjustStockBodySchema,
  createInventoryItemBodySchema,
  productScopedParamsSchema,
  stockOperationBodySchema,
} from "./inventory-schemas.js";

describe("inventory schemas", () => {
  it("accepts valid product-scoped params and rejects blank ids", () => {
    expect(
      productScopedParamsSchema.safeParse({ organizationId: "o1", productId: "p1" }).success,
    ).toBe(true);
    expect(productScopedParamsSchema.safeParse({ organizationId: " ", productId: "p1" }).success).toBe(
      false,
    );
    expect(
      productScopedParamsSchema.safeParse({ organizationId: "o1", productId: "p1", extra: 1 }).success,
    ).toBe(false);
  });

  it("validates the create body and normalizes a blank reason to null", () => {
    const parsed = createInventoryItemBodySchema.safeParse({
      availableQuantity: 10,
      minimumQuantity: 2,
      reason: "   ",
      createdByUserId: "user-1",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reason).toBeNull();
    }

    expect(createInventoryItemBodySchema.safeParse({ createdByUserId: " " }).success).toBe(false);
    expect(
      createInventoryItemBodySchema.safeParse({ availableQuantity: -1, createdByUserId: "user-1" })
        .success,
    ).toBe(false);
    expect(
      createInventoryItemBodySchema.safeParse({ availableQuantity: 1.5, createdByUserId: "user-1" })
        .success,
    ).toBe(false);
  });

  it("requires a positive integer quantity for stock operations", () => {
    expect(
      stockOperationBodySchema.safeParse({ quantity: 5, createdByUserId: "user-1" }).success,
    ).toBe(true);
    expect(
      stockOperationBodySchema.safeParse({ quantity: 0, createdByUserId: "user-1" }).success,
    ).toBe(false);
    expect(
      stockOperationBodySchema.safeParse({ quantity: -1, createdByUserId: "user-1" }).success,
    ).toBe(false);
    expect(
      stockOperationBodySchema.safeParse({ quantity: 2, createdByUserId: " " }).success,
    ).toBe(false);
  });

  it("allows zero for adjustments but rejects negative values", () => {
    expect(adjustStockBodySchema.safeParse({ quantity: 0, createdByUserId: "user-1" }).success).toBe(
      true,
    );
    expect(
      adjustStockBodySchema.safeParse({ quantity: -1, createdByUserId: "user-1" }).success,
    ).toBe(false);
  });
});
