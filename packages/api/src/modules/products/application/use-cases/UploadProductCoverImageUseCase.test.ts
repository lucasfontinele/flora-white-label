import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { UploadProductCoverImageUseCase } from "./UploadProductCoverImageUseCase.js";
import {
  fixedNow,
  immediateUnitOfWork,
  InMemoryProductImageStorageService,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

function makeSut() {
  const repository = new InMemoryProductRepository();
  const storageService = new InMemoryProductImageStorageService();
  const product = Product.create(
    { ...validCreateProductInput, price: MoneyInCents.create(15900) },
    "product-1",
  );
  repository.seed(product);
  const useCase = new UploadProductCoverImageUseCase({
    productRepository: repository,
    storageService,
    unitOfWork: immediateUnitOfWork,
    now: () => fixedNow,
  });

  return { repository, storageService, useCase };
}

const validUpload = {
  organizationId: "organization-1",
  productId: "product-1",
  fileName: "cover.png",
  mimeType: "image/png",
  size: 1024,
  content: new Uint8Array([1, 2, 3]),
};

describe("UploadProductCoverImageUseCase", () => {
  it("uploads the image and persists a namespaced storage key on the product", async () => {
    const { repository, storageService, useCase } = makeSut();

    const output = await useCase.execute(validUpload);

    expect(storageService.uploads).toHaveLength(1);
    const storageKey = storageService.uploads[0]!.storageKey;
    expect(storageKey).toContain("organizations/organization-1/products/product-1/cover-images/");
    expect(storageKey).toContain("cover.png");
    expect(output.coverImageStorageKey).toBe(storageKey);
    expect(repository.products.get("product-1")?.coverImageStorageKey).toBe(storageKey);
  });

  it("replaces an existing image and best-effort deletes the previous object", async () => {
    const { storageService, useCase } = makeSut();

    const first = await useCase.execute(validUpload);
    const second = await useCase.execute({ ...validUpload, fileName: "new-cover.png" });

    expect(second.coverImageStorageKey).not.toBe(first.coverImageStorageKey);
    expect(storageService.deleted).toEqual([first.coverImageStorageKey]);
  });

  it("throws not found for missing or cross-organization products", async () => {
    const { storageService, useCase } = makeSut();

    await expect(useCase.execute({ ...validUpload, productId: "missing" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(
      useCase.execute({ ...validUpload, organizationId: "organization-2" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(storageService.uploads).toHaveLength(0);
  });
});
