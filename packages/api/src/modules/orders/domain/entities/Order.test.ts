import { describe, expect, it } from "vitest";
import { Order } from "./Order.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { OrderDeliveryType } from "../enums/OrderDeliveryType.js";
import { OrderStatus } from "../enums/OrderStatus.js";

function buildOrder() {
  return Order.create({
    organizationId: "org-1",
    patientId: "patient-1",
    deliveryType: OrderDeliveryType.Correios,
    items: [
      { productId: "product-1", unitPriceInCents: 12000, quantity: 2 },
      { productId: "product-2", unitPriceInCents: 5000, quantity: 3 },
    ],
  });
}

describe("Order", () => {
  it("creates an order that starts REQUESTED with a readable token", () => {
    const order = buildOrder();

    expect(order.status).toBe(OrderStatus.Requested);
    expect(order.token).toMatch(/^ORD-[0-9A-HJKMNP-TV-Z]{6}$/);
    expect(order.organizationId).toBe("org-1");
    expect(order.patientId).toBe("patient-1");
    expect(order.guardianId).toBeNull();
  });

  it("computes itemsAmount as the sum of item quantities and gross amount in cents", () => {
    const order = buildOrder();

    expect(order.itemsAmount).toBe(5);
    expect(order.grossAmountInCents).toBe(12000 * 2 + 5000 * 3);
  });

  it("assigns the order id to every item", () => {
    const order = buildOrder();

    for (const item of order.items) {
      expect(item.orderId).toBe(order.id);
    }
  });

  it("requires at least one item", () => {
    expect(() =>
      Order.create({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Pickup,
        items: [],
      }),
    ).toThrow(DomainValidationError);
  });

  it("uses a provided token instead of generating one", () => {
    const order = Order.create({
      organizationId: "org-1",
      patientId: "patient-1",
      deliveryType: OrderDeliveryType.Pickup,
      items: [{ productId: "product-1", unitPriceInCents: 1000, quantity: 1 }],
      token: "ORD-CUSTOM",
    });

    expect(order.token).toBe("ORD-CUSTOM");
  });

  it("cancels an order and blocks further changes", () => {
    const order = buildOrder();

    order.cancel();

    expect(order.status).toBe(OrderStatus.Cancelled);
    expect(order.isCancelled).toBe(true);
    expect(() => order.cancel()).toThrow(DomainValidationError);
    expect(() => order.ensureMutable()).toThrow(DomainValidationError);
  });

  it("marks an order ready for pickup", () => {
    const order = buildOrder();

    order.markReadyForPickup();

    expect(order.status).toBe(OrderStatus.ReadyForPickup);
  });

  it("marks an order as shipped (awaiting correios)", () => {
    const order = buildOrder();

    order.markShipped();

    expect(order.status).toBe(OrderStatus.Shipped);
  });

  it("blocks fulfillment transitions on a cancelled order", () => {
    const order = buildOrder();
    order.cancel();

    expect(() => order.markReadyForPickup()).toThrow(DomainValidationError);
    expect(() => order.markShipped()).toThrow(DomainValidationError);
  });

  it("generates distinct tokens with the ORD- prefix", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => Order.generateToken()));

    expect(tokens.size).toBeGreaterThan(1);
    for (const token of tokens) {
      expect(token.startsWith("ORD-")).toBe(true);
    }
  });
});
