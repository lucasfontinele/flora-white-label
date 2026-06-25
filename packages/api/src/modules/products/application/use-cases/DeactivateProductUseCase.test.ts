import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { DeactivateProductUseCase } from "./DeactivateProductUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

describe("DeactivateProductUseCase", () => {
  it("deactivates an active scoped product and remains idempotent", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const useCase = new DeactivateProductUseCase({
      productRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "organization-1", productId: "product-1" }),
    ).resolves.toMatchObject({ isActive: false });
    await expect(
      useCase.execute({ organizationId: "organization-1", productId: "product-1" }),
    ).resolves.toMatchObject({ isActive: false });
  });

  it("throws not found for cross-organization products", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const useCase = new DeactivateProductUseCase({
      productRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "organization-2", productId: "product-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
