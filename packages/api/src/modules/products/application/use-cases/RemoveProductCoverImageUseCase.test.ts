import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { RemoveProductCoverImageUseCase } from "./RemoveProductCoverImageUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryProductImageStorageService,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

function makeSut(coverImageStorageKey: string | null = null) {
  const repository = new InMemoryProductRepository();
  const storageService = new InMemoryProductImageStorageService();
  const product = Product.create(
    { ...validCreateProductInput, price: MoneyInCents.create(15900), coverImageStorageKey },
    "product-1",
  );
  repository.seed(product);
  const useCase = new RemoveProductCoverImageUseCase({
    productRepository: repository,
    storageService,
    unitOfWork: immediateUnitOfWork,
  });

  return { repository, storageService, useCase };
}

const params = { organizationId: "organization-1", productId: "product-1" };

describe("RemoveProductCoverImageUseCase", () => {
  it("clears the stored key and best-effort deletes the object", async () => {
    const { repository, storageService, useCase } = makeSut("some/cover-key.png");

    const output = await useCase.execute(params);

    expect(output.coverImageStorageKey).toBeNull();
    expect(repository.products.get("product-1")?.coverImageStorageKey).toBeNull();
    expect(storageService.deleted).toEqual(["some/cover-key.png"]);
  });

  it("is a no-op when there is no cover image attached", async () => {
    const { repository, storageService, useCase } = makeSut(null);

    const output = await useCase.execute(params);

    expect(output.coverImageStorageKey).toBeNull();
    expect(repository.saveCalls).toBe(0);
    expect(storageService.deleted).toHaveLength(0);
  });

  it("throws not found for missing or cross-organization products", async () => {
    const { useCase } = makeSut("some/cover-key.png");

    await expect(useCase.execute({ ...params, productId: "missing" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(
      useCase.execute({ ...params, organizationId: "organization-2" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
