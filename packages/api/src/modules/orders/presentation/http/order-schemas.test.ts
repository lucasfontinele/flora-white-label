import { describe, expect, it } from "vitest";
import {
  createOrderBodySchema,
  createPaymentBodySchema,
  listOrdersQuerySchema,
  orderParamsSchema,
  organizationParamsSchema,
  paymentParamsSchema,
} from "./order-schemas.js";

describe("order schemas", () => {
  it("accepts a valid create-order body and normalizes a blank guardianId to null", () => {
    const parsed = createOrderBodySchema.safeParse({
      patientId: "patient-1",
      guardianId: "   ",
      deliveryType: "CORREIOS",
      items: [{ productId: "product-1", quantity: 2 }],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.guardianId).toBeNull();
    }
  });

  it("rejects an order without items or with an invalid quantity", () => {
    expect(
      createOrderBodySchema.safeParse({
        patientId: "patient-1",
        deliveryType: "PICKUP",
        items: [],
      }).success,
    ).toBe(false);

    expect(
      createOrderBodySchema.safeParse({
        patientId: "patient-1",
        deliveryType: "PICKUP",
        items: [{ productId: "product-1", quantity: 0 }],
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown delivery type and unknown fields", () => {
    expect(
      createOrderBodySchema.safeParse({
        patientId: "patient-1",
        deliveryType: "DRONE",
        items: [{ productId: "product-1", quantity: 1 }],
      }).success,
    ).toBe(false);

    expect(
      createOrderBodySchema.safeParse({
        patientId: "patient-1",
        deliveryType: "PICKUP",
        items: [{ productId: "product-1", quantity: 1 }],
        extra: true,
      }).success,
    ).toBe(false);
  });

  it("validates the create-payment body and the discount range", () => {
    expect(createPaymentBodySchema.safeParse({ paymentMethod: "PIX" }).success).toBe(true);
    expect(createPaymentBodySchema.safeParse({ paymentMethod: "PIX", discount: 0.1 }).success).toBe(
      true,
    );
    expect(createPaymentBodySchema.safeParse({ paymentMethod: "PIX", discount: 0 }).success).toBe(
      false,
    );
    expect(
      createPaymentBodySchema.safeParse({ paymentMethod: "PIX", discount: 1.5 }).success,
    ).toBe(false);
    expect(createPaymentBodySchema.safeParse({ paymentMethod: "INVALID" }).success).toBe(false);
  });

  it("parses the comma-separated status filter and rejects unknown statuses", () => {
    const parsed = listOrdersQuerySchema.safeParse({ status: "REQUESTED,UNDER_REVIEW" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toEqual(["REQUESTED", "UNDER_REVIEW"]);
    }

    expect(listOrdersQuerySchema.safeParse({}).success).toBe(true);
    expect(listOrdersQuerySchema.safeParse({ status: "REQUESTED,NOPE" }).success).toBe(false);
  });

  it("validates path params", () => {
    expect(organizationParamsSchema.safeParse({ organizationId: "o1" }).success).toBe(true);
    expect(orderParamsSchema.safeParse({ organizationId: "o1", orderId: "or1" }).success).toBe(
      true,
    );
    expect(
      paymentParamsSchema.safeParse({ organizationId: "o1", orderId: "or1", paymentId: "p1" })
        .success,
    ).toBe(true);
    expect(orderParamsSchema.safeParse({ organizationId: " ", orderId: "or1" }).success).toBe(
      false,
    );
  });
});
