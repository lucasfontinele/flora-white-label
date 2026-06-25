import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import { UpdateProductUseCase } from "./UpdateProductUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

function makeSut() {
  const repository = new InMemoryProductRepository();
  const product = Product.create(
    { ...validCreateProductInput, price: MoneyInCents.create(15900) },
    "product-1",
  );
  repository.seed(product);
  const useCase = new UpdateProductUseCase({
    productRepository: repository,
    unitOfWork: immediateUnitOfWork,
  });

  return { repository, useCase };
}

describe("UpdateProductUseCase", () => {
  it("updates editable catalog data and preserves id and organization", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "organization-1",
      productId: "product-1",
      name: "CBD Oil 1500mg",
      description: null,
      category: ProductCategory.Oil,
      type: ProductType.Cbd,
      strainType: null,
      thcPercentage: 0,
      cbdPercentage: 15,
      unit: ProductUnit.Milliliter,
      priceInCents: 18900,
    });

    expect(output.id).toBe("product-1");
    expect(output.organizationId).toBe("organization-1");
    expect(output.name).toBe("CBD Oil 1500mg");
    expect(output.description).toBeNull();
    expect(output.cbdPercentage).toBe(15);
    expect(output.priceInCents).toBe(18900);
  });

  it("throws not found for missing or cross-organization products", async () => {
    const { useCase } = makeSut();
    const input = {
      ...validCreateProductInput,
      productId: "missing",
      priceInCents: 18900,
    };

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      useCase.execute({ ...input, organizationId: "organization-2", productId: "product-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("does not save when validation fails", async () => {
    const { repository, useCase } = makeSut();

    await expect(
      useCase.execute({
        ...validCreateProductInput,
        productId: "product-1",
        priceInCents: -1,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(repository.saveCalls).toBe(0);
    expect(repository.products.get("product-1")?.priceInCents).toBe(15900);
  });
});
