import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";

export interface ActivateProductInput {
  organizationId: string;
  productId: string;
}

export interface ActivateProductDependencies {
  productRepository: ProductRepository;
  unitOfWork: UnitOfWork;
}

export class ActivateProductUseCase {
  constructor(private readonly deps: ActivateProductDependencies) {}

  async execute(input: ActivateProductInput): Promise<ProductReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const product = await this.deps.productRepository.findByIdInOrganization(
        input.organizationId,
        input.productId,
      );

      if (!product) {
        throw new NotFoundError("Product not found.");
      }

      product.activate();

      return this.deps.productRepository.save(product);
    });
  }
}
