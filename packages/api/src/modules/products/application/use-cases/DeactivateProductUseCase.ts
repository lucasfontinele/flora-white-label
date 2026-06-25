import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";

export interface DeactivateProductInput {
  organizationId: string;
  productId: string;
}

export interface DeactivateProductDependencies {
  productRepository: ProductRepository;
  unitOfWork: UnitOfWork;
}

export class DeactivateProductUseCase {
  constructor(private readonly deps: DeactivateProductDependencies) {}

  async execute(input: DeactivateProductInput): Promise<ProductReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const product = await this.deps.productRepository.findByIdInOrganization(
        input.organizationId,
        input.productId,
      );

      if (!product) {
        throw new NotFoundError("Product not found.");
      }

      product.deactivate();

      return this.deps.productRepository.save(product);
    });
  }
}
