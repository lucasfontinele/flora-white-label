import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";
import type { ProductImageStorageService } from "../services/ProductImageStorageService.js";
import { buildProductCoverImageStorageKey } from "./product-cover-image.helpers.js";

export interface UploadProductCoverImageInput {
  organizationId: string;
  productId: string;
  fileName: string;
  mimeType: string;
  size: number;
  content: Uint8Array;
}

export interface UploadProductCoverImageDependencies {
  productRepository: ProductRepository;
  storageService: ProductImageStorageService;
  unitOfWork: UnitOfWork;
  now?: () => Date;
}

/**
 * Stores a product's cover image in object storage and persists the resulting
 * storage key on the product. The upload to R2 happens before the transaction
 * so a storage failure never leaves a dangling key in the database. A previously
 * attached image is best-effort deleted after the new key is committed.
 */
export class UploadProductCoverImageUseCase {
  constructor(private readonly deps: UploadProductCoverImageDependencies) {}

  async execute(input: UploadProductCoverImageInput): Promise<ProductReadModel> {
    const product = await this.deps.productRepository.findByIdInOrganization(
      input.organizationId,
      input.productId,
    );
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const previousStorageKey = product.coverImageStorageKey;

    const storageKey = buildProductCoverImageStorageKey({
      organizationId: input.organizationId,
      productId: input.productId,
      fileName: input.fileName,
      timestamp: (this.deps.now ?? (() => new Date()))().getTime(),
    });

    const upload = await this.deps.storageService.upload({
      storageKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      content: input.content,
    });

    const output = await this.deps.unitOfWork.execute(async () => {
      product.setCoverImage(upload.storageKey);
      return this.deps.productRepository.save(product);
    });

    // The previous object is now orphaned; removing it is best-effort and must
    // not fail the request now that the new key is committed.
    if (previousStorageKey && previousStorageKey !== upload.storageKey) {
      await this.deps.storageService.delete(previousStorageKey).catch(() => undefined);
    }

    return output;
  }
}
