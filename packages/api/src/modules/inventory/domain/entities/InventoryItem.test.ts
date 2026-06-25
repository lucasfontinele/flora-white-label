import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InventoryItem } from "./InventoryItem.js";
import { InventoryMovementType } from "../enums/InventoryMovementType.js";

function makeItem(available = 0, minimum = 0) {
  const item = InventoryItem.create({
    organizationId: "organization-1",
    productId: "product-1",
    availableQuantity: available,
    minimumQuantity: minimum,
  });
  // Drain the opening IN movement buffered on creation so each test asserts
  // only the movement produced by the operation under test.
  item.pullMovements();

  return item;
}

describe("InventoryItem", () => {
  it("creates a position starting with reserved zero and no movement when available is zero", () => {
    const item = makeItem(0, 10);

    expect(item.organizationId).toBe("organization-1");
    expect(item.productId).toBe("product-1");
    expect(item.availableQuantity).toBe(0);
    expect(item.reservedQuantity).toBe(0);
    expect(item.minimumQuantity).toBe(10);
    expect(item.belowMinimum).toBe(true);
    expect(item.pullMovements()).toHaveLength(0);
  });

  it("buffers an opening IN movement when created with available greater than zero", () => {
    const item = InventoryItem.create({
      organizationId: "organization-1",
      productId: "product-1",
      availableQuantity: 100,
      minimumQuantity: 10,
      reason: "Opening",
    });

    const movements = item.pullMovements();
    expect(movements).toHaveLength(1);
    expect(movements[0]).toMatchObject({
      type: InventoryMovementType.In,
      quantity: 100,
      reason: "Opening",
    });
    expect(item.belowMinimum).toBe(false);
  });

  it("requires organizationId and productId", () => {
    expect(() => makeItemWith({ organizationId: " " })).toThrow(DomainValidationError);
    expect(() => makeItemWith({ productId: " " })).toThrow(DomainValidationError);
  });

  it("adds stock and records one IN movement", () => {
    const item = makeItem(10);

    item.addStock(5, "purchase");

    expect(item.availableQuantity).toBe(15);
    const movements = item.pullMovements();
    expect(movements).toHaveLength(1);
    expect(movements[0]?.type).toBe(InventoryMovementType.In);
  });

  it("reserves available quantity and records a RESERVE movement", () => {
    const item = makeItem(10);

    item.reserve(4);

    expect(item.availableQuantity).toBe(6);
    expect(item.reservedQuantity).toBe(4);
    expect(item.pullMovements()[0]?.type).toBe(InventoryMovementType.Reserve);
  });

  it("rejects reserving more than available and records no movement", () => {
    const item = makeItem(3);

    expect(() => item.reserve(4)).toThrow(DomainValidationError);
    expect(item.availableQuantity).toBe(3);
    expect(item.reservedQuantity).toBe(0);
    expect(item.pullMovements()).toHaveLength(0);
  });

  it("releases reservation back to available and records a RELEASE movement", () => {
    const item = makeItem(10);
    item.reserve(6);
    item.pullMovements();

    item.releaseReservation(2);

    expect(item.reservedQuantity).toBe(4);
    expect(item.availableQuantity).toBe(6);
    expect(item.pullMovements()[0]?.type).toBe(InventoryMovementType.Release);
  });

  it("rejects releasing more than reserved and records no movement", () => {
    const item = makeItem(10);
    item.reserve(3);
    item.pullMovements();

    expect(() => item.releaseReservation(4)).toThrow(DomainValidationError);
    expect(item.reservedQuantity).toBe(3);
    expect(item.pullMovements()).toHaveLength(0);
  });

  it("confirms stock-out from reserved and records an OUT movement without touching available", () => {
    const item = makeItem(10);
    item.reserve(6);
    item.pullMovements();

    item.confirmStockOut(4);

    expect(item.reservedQuantity).toBe(2);
    expect(item.availableQuantity).toBe(4);
    expect(item.pullMovements()[0]?.type).toBe(InventoryMovementType.Out);
  });

  it("rejects confirming stock-out beyond reserved and records no movement", () => {
    const item = makeItem(10);
    item.reserve(2);
    item.pullMovements();

    expect(() => item.confirmStockOut(3)).toThrow(DomainValidationError);
    expect(item.reservedQuantity).toBe(2);
    expect(item.pullMovements()).toHaveLength(0);
  });

  it("adjusts available to an absolute value, preserves reserved, and records an ADJUSTMENT", () => {
    const item = makeItem(10);
    item.reserve(4);
    item.pullMovements();

    item.adjustStock(20);

    expect(item.availableQuantity).toBe(20);
    expect(item.reservedQuantity).toBe(4);
    const movements = item.pullMovements();
    expect(movements[0]?.type).toBe(InventoryMovementType.Adjustment);
    expect(movements[0]?.quantity).toBe(20);
  });

  it("allows adjusting available to zero", () => {
    const item = makeItem(10);

    item.adjustStock(0);

    expect(item.availableQuantity).toBe(0);
  });

  it("rejects non-positive operation quantities", () => {
    const item = makeItem(10);

    expect(() => item.addStock(0)).toThrow(DomainValidationError);
    expect(() => item.reserve(-1)).toThrow(DomainValidationError);
    expect(() => item.addStock(1.5)).toThrow(DomainValidationError);
  });

  it("rejects negative adjustment quantities", () => {
    const item = makeItem(10);

    expect(() => item.adjustStock(-1)).toThrow(DomainValidationError);
  });
});

function makeItemWith(overrides: { organizationId?: string; productId?: string }) {
  return InventoryItem.create({
    organizationId: overrides.organizationId ?? "organization-1",
    productId: overrides.productId ?? "product-1",
  });
}
