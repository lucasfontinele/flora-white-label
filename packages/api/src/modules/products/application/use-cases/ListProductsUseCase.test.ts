import { describe, expect, it } from "vitest";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Product } from "../../domain/entities/Product.js";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import { ListProductsUseCase } from "./ListProductsUseCase.js";
import { InMemoryProductRepository, validCreateProductInput } from "./product-use-case-test-utils.js";

describe("ListProductsUseCase", () => {
  it("lists only products that belong to the requested organization", async () => {
    const repository = new InMemoryProductRepository();
    repository.seed(
      Product.create({ ...validCreateProductInput, price: MoneyInCents.create(15900) }, "product-1"),
    );
    const inactive = Product.create(
      {
        ...validCreateProductInput,
        name: "Flower 1g",
        category: ProductCategory.Flower,
        type: ProductType.Thc,
        unit: ProductUnit.Gram,
        price: MoneyInCents.create(5000),
      },
      "product-2",
    );
    inactive.deactivate();
    repository.seed(inactive);
    repository.seed(
      Product.create(
        {
          ...validCreateProductInput,
          organizationId: "organization-2",
          price: MoneyInCents.create(12000),
        },
        "product-3",
      ),
    );

    const useCase = new ListProductsUseCase(repository);
    const output = await useCase.execute({ organizationId: "organization-1" });

    expect(output.data).toHaveLength(2);
    expect(output.data.map((product) => product.id)).toEqual(["product-1", "product-2"]);
    expect(output.data.map((product) => product.isActive)).toEqual([true, false]);
  });

  it("returns an empty list when the organization has no products", async () => {
    const useCase = new ListProductsUseCase(new InMemoryProductRepository());

    await expect(useCase.execute({ organizationId: "organization-1" })).resolves.toEqual({
      data: [],
    });
  });
});
