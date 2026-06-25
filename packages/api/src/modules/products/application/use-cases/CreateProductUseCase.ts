import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import { Product } from "../../domain/entities/Product.js";
import type { ProductCategory } from "../../domain/enums/ProductCategory.js";
import type { ProductType } from "../../domain/enums/ProductType.js";
import type { ProductUnit } from "../../domain/enums/ProductUnit.js";
import type { StrainType } from "../../domain/enums/StrainType.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";

export interface CreateProductInput {
  organizationId: string;
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

export interface CreateProductDependencies {
  organizationRepository: OrganizationRepository;
  productRepository: ProductRepository;
  unitOfWork: UnitOfWork;
}

export class CreateProductUseCase {
  constructor(private readonly deps: CreateProductDependencies) {}

  async execute(input: CreateProductInput): Promise<ProductReadModel> {
    const organization = await this.deps.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const product = Product.create({
      organizationId: input.organizationId,
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

    return this.deps.unitOfWork.execute(() => this.deps.productRepository.create(product));
  }
}
