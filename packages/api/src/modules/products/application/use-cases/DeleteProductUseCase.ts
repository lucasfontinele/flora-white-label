import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";

export interface DeleteProductInput {
  organizationId: string;
  productId: string;
}

export interface DeleteProductDependencies {
  productRepository: ProductRepository;
  unitOfWork: UnitOfWork;
}

export class DeleteProductUseCase {
  constructor(private readonly deps: DeleteProductDependencies) {}

  async execute(input: DeleteProductInput): Promise<ProductReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const product = await this.deps.productRepository.findByIdInOrganization(
        input.organizationId,
        input.productId,
      );

      if (!product) {
        throw new NotFoundError("Product not found.");
      }

      product.delete();

      return this.deps.productRepository.save(product);
    });
  }
}
