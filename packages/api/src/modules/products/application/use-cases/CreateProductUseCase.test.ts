import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { CreateProductUseCase } from "./CreateProductUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryOrganizationRepository,
  InMemoryProductRepository,
  validCreateProductInput,
} from "./product-use-case-test-utils.js";

function makeSut(organizationIds = ["organization-1"]) {
  const organizationRepository = new InMemoryOrganizationRepository(organizationIds);
  const productRepository = new InMemoryProductRepository();
  const useCase = new CreateProductUseCase({
    organizationRepository,
    productRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { productRepository, useCase };
}

describe("CreateProductUseCase", () => {
  it("creates an active product for an existing organization", async () => {
    const { productRepository, useCase } = makeSut();

    const output = await useCase.execute({
      ...validCreateProductInput,
      name: "  CBD Oil 1000mg  ",
      description: "  Frasco com 30ml.  ",
    });

    expect(output.id).toEqual(expect.any(String));
    expect(output.organizationId).toBe("organization-1");
    expect(output.name).toBe("CBD Oil 1000mg");
    expect(output.description).toBe("Frasco com 30ml.");
    expect(output.priceInCents).toBe(15900);
    expect(output.isActive).toBe(true);
    expect(productRepository.products.size).toBe(1);
  });

  it("throws when organization does not exist", async () => {
    const { productRepository, useCase } = makeSut([]);

    await expect(useCase.execute(validCreateProductInput)).rejects.toBeInstanceOf(NotFoundError);
    expect(productRepository.products.size).toBe(0);
  });

  it("rejects invalid required fields, money and percentages before persistence", async () => {
    const { productRepository, useCase } = makeSut();

    await expect(useCase.execute({ ...validCreateProductInput, name: " " })).rejects.toBeInstanceOf(
      DomainValidationError,
    );
    await expect(
      useCase.execute({ ...validCreateProductInput, priceInCents: 10.5 }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    await expect(
      useCase.execute({ ...validCreateProductInput, priceInCents: -1 }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    await expect(
      useCase.execute({ ...validCreateProductInput, thcPercentage: -1 }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    await expect(
      useCase.execute({ ...validCreateProductInput, cbdPercentage: -1 }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(productRepository.products.size).toBe(0);
  });
});
