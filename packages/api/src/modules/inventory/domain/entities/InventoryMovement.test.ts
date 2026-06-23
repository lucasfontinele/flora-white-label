import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Quantity } from "../../../../shared/domain/value-objects/Quantity.js";
import { InventoryMovement } from "./InventoryMovement.js";
import { InventoryMovementType } from "../enums/InventoryMovementType.js";

function validProps(overrides: Partial<Parameters<typeof InventoryMovement.create>[0]> = {}) {
  return {
    organizationId: "organization-1",
    inventoryItemId: "inventory-item-1",
    productId: "product-1",
    type: InventoryMovementType.In,
    quantity: Quantity.create(10),
    reason: "purchase",
    createdByUserId: "user-1",
    ...overrides,
  };
}

describe("InventoryMovement", () => {
  it("creates a valid movement and exposes its fields", () => {
    const movement = InventoryMovement.create(validProps());

    expect(movement.id).toEqual(expect.any(String));
    expect(movement.organizationId).toBe("organization-1");
    expect(movement.inventoryItemId).toBe("inventory-item-1");
    expect(movement.productId).toBe("product-1");
    expect(movement.type).toBe(InventoryMovementType.In);
    expect(movement.quantity).toBe(10);
    expect(movement.reason).toBe("purchase");
    expect(movement.createdByUserId).toBe("user-1");
  });

  it("normalizes a blank reason to null", () => {
    const movement = InventoryMovement.create(validProps({ reason: "   " }));

    expect(movement.reason).toBeNull();
  });

  it("requires non-blank identifiers and actor", () => {
    expect(() => InventoryMovement.create(validProps({ organizationId: " " }))).toThrow(
      DomainValidationError,
    );
    expect(() => InventoryMovement.create(validProps({ inventoryItemId: " " }))).toThrow(
      DomainValidationError,
    );
    expect(() => InventoryMovement.create(validProps({ productId: " " }))).toThrow(
      DomainValidationError,
    );
    expect(() => InventoryMovement.create(validProps({ createdByUserId: " " }))).toThrow(
      DomainValidationError,
    );
  });

  it("rejects an invalid movement type", () => {
    expect(() =>
      InventoryMovement.create(validProps({ type: "INVALID" as InventoryMovementType })),
    ).toThrow(DomainValidationError);
  });
});
