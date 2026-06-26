import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { ProductCategory } from "../enums/ProductCategory.js";
import { ProductType } from "../enums/ProductType.js";
import { ProductUnit } from "../enums/ProductUnit.js";
import { StrainType } from "../enums/StrainType.js";
import { Product } from "./Product.js";

const baseProps = {
  organizationId: "organization-1",
  name: "CBD Oil 1000mg",
  description: "Frasco com 30ml.",
  category: ProductCategory.Oil,
  type: ProductType.Cbd,
  strainType: null,
  thcPercentage: 0,
  cbdPercentage: 10,
  unit: ProductUnit.Milliliter,
  price: MoneyInCents.create(15900),
};

describe("Product", () => {
  it("creates a valid active product with trimmed text", () => {
    const product = Product.create({
      ...baseProps,
      name: "  CBD Oil 1000mg  ",
      description: "  Frasco com 30ml.  ",
    });

    expect(product.organizationId).toBe("organization-1");
    expect(product.name).toBe("CBD Oil 1000mg");
    expect(product.description).toBe("Frasco com 30ml.");
    expect(product.category).toBe(ProductCategory.Oil);
    expect(product.type).toBe(ProductType.Cbd);
    expect(product.unit).toBe(ProductUnit.Milliliter);
    expect(product.priceInCents).toBe(15900);
    expect(product.isActive).toBe(true);
  });

  it("normalizes omitted or blank optional fields to null", () => {
    const product = Product.create({
      ...baseProps,
      description: "  ",
      strainType: undefined,
      thcPercentage: undefined,
      cbdPercentage: undefined,
    });

    expect(product.description).toBeNull();
    expect(product.strainType).toBeNull();
    expect(product.thcPercentage).toBeNull();
    expect(product.cbdPercentage).toBeNull();
  });

  it("accepts zero percentages and an explicit strain type", () => {
    const product = Product.create({
      ...baseProps,
      category: ProductCategory.Flower,
      strainType: StrainType.Hybrid,
      thcPercentage: 0,
      cbdPercentage: 0,
      unit: ProductUnit.Gram,
    });

    expect(product.strainType).toBe(StrainType.Hybrid);
    expect(product.thcPercentage).toBe(0);
    expect(product.cbdPercentage).toBe(0);
  });

  it("rejects missing organization, blank name, invalid enums and negative percentages", () => {
    expect(() => Product.create({ ...baseProps, organizationId: " " })).toThrow(
      DomainValidationError,
    );
    expect(() => Product.create({ ...baseProps, name: " " })).toThrow(DomainValidationError);
    expect(() =>
      Product.create({ ...baseProps, category: "INVALID" as ProductCategory }),
    ).toThrow(DomainValidationError);
    expect(() => Product.create({ ...baseProps, type: "INVALID" as ProductType })).toThrow(
      DomainValidationError,
    );
    expect(() => Product.create({ ...baseProps, unit: "INVALID" as ProductUnit })).toThrow(
      DomainValidationError,
    );
    expect(() =>
      Product.create({ ...baseProps, strainType: "INVALID" as StrainType }),
    ).toThrow(DomainValidationError);
    expect(() => Product.create({ ...baseProps, thcPercentage: -1 })).toThrow(
      DomainValidationError,
    );
    expect(() => Product.create({ ...baseProps, cbdPercentage: -1 })).toThrow(
      DomainValidationError,
    );
  });

  it("uses MoneyInCents for price validation", () => {
    expect(() => Product.create({ ...baseProps, price: MoneyInCents.create(10.5) })).toThrow(
      DomainValidationError,
    );
    expect(() => Product.create({ ...baseProps, price: MoneyInCents.create(-1) })).toThrow(
      DomainValidationError,
    );
  });

  it("updates catalog data without changing identity, organization or active state", () => {
    const product = Product.create(baseProps, "product-1");
    product.deactivate();

    product.updateCatalogData({
      name: "CBD Oil 1500mg",
      description: null,
      category: ProductCategory.Oil,
      type: ProductType.Cbd,
      strainType: null,
      thcPercentage: 0,
      cbdPercentage: 15,
      unit: ProductUnit.Milliliter,
      price: MoneyInCents.create(18900),
    });

    expect(product.id).toBe("product-1");
    expect(product.organizationId).toBe("organization-1");
    expect(product.name).toBe("CBD Oil 1500mg");
    expect(product.description).toBeNull();
    expect(product.cbdPercentage).toBe(15);
    expect(product.priceInCents).toBe(18900);
    expect(product.isActive).toBe(false);
  });

  it("manages the cover image storage key and preserves it across catalog updates", () => {
    const product = Product.create(baseProps, "product-1");
    expect(product.coverImageStorageKey).toBeNull();

    product.setCoverImage("  organizations/org-1/products/product-1/cover-images/1-cover.png  ");
    expect(product.coverImageStorageKey).toBe(
      "organizations/org-1/products/product-1/cover-images/1-cover.png",
    );

    product.updateCatalogData({
      name: "CBD Oil 1500mg",
      description: null,
      category: ProductCategory.Oil,
      type: ProductType.Cbd,
      strainType: null,
      thcPercentage: 0,
      cbdPercentage: 15,
      unit: ProductUnit.Milliliter,
      price: MoneyInCents.create(18900),
    });
    expect(product.coverImageStorageKey).toBe(
      "organizations/org-1/products/product-1/cover-images/1-cover.png",
    );

    product.removeCoverImage();
    expect(product.coverImageStorageKey).toBeNull();
  });

  it("normalizes a provided cover image key and rejects a blank one", () => {
    expect(Product.create({ ...baseProps, coverImageStorageKey: "  " }).coverImageStorageKey).toBeNull();

    const product = Product.create(baseProps);
    expect(() => product.setCoverImage("   ")).toThrow(DomainValidationError);
  });

  it("activates, deactivates and soft deletes idempotently", () => {
    const product = Product.create(baseProps);

    product.deactivate();
    product.deactivate();
    expect(product.isActive).toBe(false);

    product.activate();
    product.activate();
    expect(product.isActive).toBe(true);

    product.delete();
    product.delete();
    expect(product.isActive).toBe(false);
  });
});
