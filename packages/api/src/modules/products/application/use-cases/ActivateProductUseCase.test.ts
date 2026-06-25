import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { ActivateProductUseCase } from "./ActivateProductUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

describe("ActivateProductUseCase", () => {
  it("activates an inactive scoped product and remains idempotent", async () => {
    const repository = new InMemoryProductRepository();
    const product = Product.create(
      { ...validCreateProductInput, price: MoneyInCents.create(15900) },
      "product-1",
    );
    product.deactivate();
    repository.seed(product);
    const useCase = new ActivateProductUseCase({ productRepository: repository, unitOfWork: immediateUnitOfWork });

    await expect(
      useCase.execute({ organizationId: "organization-1", productId: "product-1" }),
    ).resolves.toMatchObject({ isActive: true });
    await expect(
      useCase.execute({ organizationId: "organization-1", productId: "product-1" }),
    ).resolves.toMatchObject({ isActive: true });
  });

  it("throws not found for cross-organization products", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const useCase = new ActivateProductUseCase({ productRepository: repository, unitOfWork: immediateUnitOfWork });

    await expect(
      useCase.execute({ organizationId: "organization-2", productId: "product-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
