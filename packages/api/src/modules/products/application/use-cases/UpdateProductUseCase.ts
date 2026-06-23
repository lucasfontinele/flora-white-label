import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { ProductCategory } from "../../domain/enums/ProductCategory.js";
import type { ProductType } from "../../domain/enums/ProductType.js";
import type { ProductUnit } from "../../domain/enums/ProductUnit.js";
import type { StrainType } from "../../domain/enums/StrainType.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";

export interface UpdateProductInput {
  organizationId: string;
  productId: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  type: ProductType;
  strainType?: StrainType | null;
  thcPercentage?: number | null;
  cbdPercentage?: number | null;
  unit: ProductUnit;
  priceInCents: number;
}

export interface UpdateProductDependencies {
  productRepository: ProductRepository;
  unitOfWork: UnitOfWork;
}

export class UpdateProductUseCase {
  constructor(private readonly deps: UpdateProductDependencies) {}

  async execute(input: UpdateProductInput): Promise<ProductReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const product = await this.deps.productRepository.findByIdInOrganization(
        input.organizationId,
        input.productId,
      );

      if (!product) {
        throw new NotFoundError("Product not found.");
      }

      product.updateCatalogData({
        name: input.name,
        description: input.description,
        category: input.category,
        type: input.type,
        strainType: input.strainType,
        thcPercentage: input.thcPercentage,
        cbdPercentage: input.cbdPercentage,
        unit: input.unit,
        price: MoneyInCents.create(input.priceInCents),
      });

      return this.deps.productRepository.save(product);
    });
  }
}
