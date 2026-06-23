import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { GetProductByIdUseCase } from "./GetProductByIdUseCase.js";
import { InMemoryProductRepository, validCreateProductInput } from "./product-use-case-test-utils.js";

describe("GetProductByIdUseCase", () => {
  it("gets a product by id inside the requested organization", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const useCase = new GetProductByIdUseCase(repository);

    const output = await useCase.execute({
      organizationId: "organization-1",
      productId: "product-1",
    });

    expect(output.id).toBe("product-1");
    expect(output.organizationId).toBe("organization-1");
  });

  it("throws not found for missing or cross-organization products", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const useCase = new GetProductByIdUseCase(repository);

    await expect(
      useCase.execute({ organizationId: "organization-1", productId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      useCase.execute({ organizationId: "organization-2", productId: "product-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
