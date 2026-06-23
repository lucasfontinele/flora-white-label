import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { DeleteProductUseCase } from "./DeleteProductUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

describe("DeleteProductUseCase", () => {
  it("soft deletes a scoped product by deactivating it", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const useCase = new DeleteProductUseCase({ productRepository: repository, unitOfWork: immediateUnitOfWork });

    const output = await useCase.execute({ organizationId: "organization-1", productId: "product-1" });

    expect(output.isActive).toBe(false);
    expect(repository.products.has("product-1")).toBe(true);
    expect(repository.saveCalls).toBe(1);
  });

  it("is idempotent for inactive products and enforces organization scope", async () => {
    const repository = new InMemoryProductRepository();
    const product = Product.create(
      { ...validCreateProductInput, price: MoneyInCents.create(15900) },
      "product-1",
    );
    product.deactivate();
    repository.seed(product);
    const useCase = new DeleteProductUseCase({ productRepository: repository, unitOfWork: immediateUnitOfWork });

    await expect(
      useCase.execute({ organizationId: "organization-1", productId: "product-1" }),
    ).resolves.toMatchObject({ isActive: false });
    await expect(
      useCase.execute({ organizationId: "organization-2", productId: "product-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
