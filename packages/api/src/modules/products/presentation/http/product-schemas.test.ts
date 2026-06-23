import { describe, expect, it } from "vitest";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import {
  createProductBodySchema,
  listProductsQuerySchema,
  organizationProductParamsSchema,
  productParamsSchema,
  updateProductBodySchema,
} from "./product-schemas.js";

const validBody = {
  name: "CBD Oil 1000mg",
  description: "Frasco com 30ml.",
  category: ProductCategory.Oil,
  type: ProductType.Cbd,
  strainType: null,
  thcPercentage: 0,
  cbdPercentage: 10,
  unit: ProductUnit.Milliliter,
  priceInCents: 15900,
};

describe("product schemas", () => {
  it("accepts create body with required fields and optional nullable fields", () => {
    expect(createProductBodySchema.safeParse(validBody).success).toBe(true);
    expect(
      createProductBodySchema.safeParse({
        name: "CBD Oil 1000mg",
        category: ProductCategory.Oil,
        type: ProductType.Cbd,
        unit: ProductUnit.Milliliter,
        priceInCents: 15900,
      }).success,
    ).toBe(true);
    expect(createProductBodySchema.safeParse({ ...validBody, description: null }).success).toBe(
      true,
    );
  });

  it("trims text fields and normalizes blank optional description to null", () => {
    const result = createProductBodySchema.safeParse({
      ...validBody,
      name: "  CBD Oil 1000mg  ",
      description: "  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("CBD Oil 1000mg");
      expect(result.data.description).toBeNull();
    }
  });

  it("rejects invalid create body values", () => {
    expect(createProductBodySchema.safeParse({ ...validBody, name: " " }).success).toBe(false);
    expect(
      createProductBodySchema.safeParse({ ...validBody, category: "INVALID" }).success,
    ).toBe(false);
    expect(createProductBodySchema.safeParse({ ...validBody, type: "INVALID" }).success).toBe(
      false,
    );
    expect(createProductBodySchema.safeParse({ ...validBody, unit: "INVALID" }).success).toBe(
      false,
    );
    expect(
      createProductBodySchema.safeParse({ ...validBody, strainType: "INVALID" }).success,
    ).toBe(false);
    expect(createProductBodySchema.safeParse({ ...validBody, priceInCents: -1 }).success).toBe(
      false,
    );
    expect(createProductBodySchema.safeParse({ ...validBody, priceInCents: 10.5 }).success).toBe(
      false,
    );
    expect(createProductBodySchema.safeParse({ ...validBody, thcPercentage: -1 }).success).toBe(
      false,
    );
    expect(createProductBodySchema.safeParse({ ...validBody, cbdPercentage: -1 }).success).toBe(
      false,
    );
    expect(createProductBodySchema.safeParse({ ...validBody, extra: "field" }).success).toBe(
      false,
    );
  });

  it("requires a complete update body and rejects invalid update values", () => {
    expect(updateProductBodySchema.safeParse(validBody).success).toBe(true);
    expect(
      updateProductBodySchema.safeParse({
        name: "CBD Oil 1500mg",
        priceInCents: 18900,
      }).success,
    ).toBe(false);
    expect(updateProductBodySchema.safeParse({ ...validBody, category: "INVALID" }).success).toBe(
      false,
    );
    expect(updateProductBodySchema.safeParse({ ...validBody, priceInCents: -1 }).success).toBe(
      false,
    );
  });

  it("accepts nonblank params and rejects blank params", () => {
    expect(
      organizationProductParamsSchema.safeParse({ organizationId: "organization-1" }).success,
    ).toBe(true);
    expect(organizationProductParamsSchema.safeParse({ organizationId: " " }).success).toBe(false);

    expect(
      productParamsSchema.safeParse({
        organizationId: "organization-1",
        productId: "product-1",
      }).success,
    ).toBe(true);
    expect(
      productParamsSchema.safeParse({ organizationId: "organization-1", productId: " " }).success,
    ).toBe(false);
  });

  it("accepts empty list query and rejects unsupported query params", () => {
    expect(listProductsQuerySchema.safeParse({}).success).toBe(true);
    expect(listProductsQuerySchema.safeParse({ isActive: "true" }).success).toBe(false);
  });
});
