import { describe, expect, it } from "vitest";
import { OrderItem } from "./OrderItem.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";

describe("OrderItem", () => {
  const baseInput = {
    orderId: "order-1",
    productId: "product-1",
    unitPrice: MoneyInCents.create(12000),
    quantity: 2,
  };

  it("creates an item with a frozen unit price and computes its subtotal", () => {
    const item = OrderItem.create(baseInput);

    expect(item.orderId).toBe("order-1");
    expect(item.productId).toBe("product-1");
    expect(item.unitPriceInCents).toBe(12000);
    expect(item.quantity).toBe(2);
    expect(item.subtotalInCents).toBe(24000);
  });

  it("rejects a non-positive or non-integer quantity", () => {
    expect(() => OrderItem.create({ ...baseInput, quantity: 0 })).toThrow(DomainValidationError);
    expect(() => OrderItem.create({ ...baseInput, quantity: -1 })).toThrow(DomainValidationError);
    expect(() => OrderItem.create({ ...baseInput, quantity: 1.5 })).toThrow(DomainValidationError);
  });

  it("rejects blank ids", () => {
    expect(() => OrderItem.create({ ...baseInput, orderId: " " })).toThrow(DomainValidationError);
    expect(() => OrderItem.create({ ...baseInput, productId: " " })).toThrow(DomainValidationError);
  });
});
