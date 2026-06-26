import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";
import type { ProductImageStorageService } from "../services/ProductImageStorageService.js";

export interface RemoveProductCoverImageInput {
  organizationId: string;
  productId: string;
}

export interface RemoveProductCoverImageDependencies {
  productRepository: ProductRepository;
  storageService: ProductImageStorageService;
  unitOfWork: UnitOfWork;
}

/**
 * Clears a product's cover image. The storage key is dropped from the product
 * first; the now-orphaned object is best-effort deleted from storage afterwards.
 */
export class RemoveProductCoverImageUseCase {
  constructor(private readonly deps: RemoveProductCoverImageDependencies) {}

  async execute(input: RemoveProductCoverImageInput): Promise<ProductReadModel> {
    const product = await this.deps.productRepository.findByIdInOrganization(
      input.organizationId,
      input.productId,
    );
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const previousStorageKey = product.coverImageStorageKey;
    if (!previousStorageKey) {
      // Nothing attached; return the current state unchanged.
      const details = await this.deps.productRepository.findDetailsByIdInOrganization(
        input.organizationId,
        input.productId,
      );
      if (!details) {
        throw new NotFoundError("Product not found.");
      }

      return details;
    }

    const output = await this.deps.unitOfWork.execute(async () => {
      product.removeCoverImage();
      return this.deps.productRepository.save(product);
    });

    await this.deps.storageService.delete(previousStorageKey).catch(() => undefined);

    return output;
  }
}
