import { env } from "../../../config/env.js";
import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import type { ProductImageStorageService } from "../application/services/ProductImageStorageService.js";
import { ActivateProductUseCase } from "../application/use-cases/ActivateProductUseCase.js";
import { CreateProductUseCase } from "../application/use-cases/CreateProductUseCase.js";
import { DeactivateProductUseCase } from "../application/use-cases/DeactivateProductUseCase.js";
import { DeleteProductUseCase } from "../application/use-cases/DeleteProductUseCase.js";
import { GetProductByIdUseCase } from "../application/use-cases/GetProductByIdUseCase.js";
import { ListProductsUseCase } from "../application/use-cases/ListProductsUseCase.js";
import { RemoveProductCoverImageUseCase } from "../application/use-cases/RemoveProductCoverImageUseCase.js";
import { UpdateProductUseCase } from "../application/use-cases/UpdateProductUseCase.js";
import { UploadProductCoverImageUseCase } from "../application/use-cases/UploadProductCoverImageUseCase.js";
import { PrismaProductRepository } from "./prisma/PrismaProductRepository.js";
import { CloudflareR2ProductImageStorageService } from "./storage/CloudflareR2ProductImageStorageService.js";

export interface ProductUseCases {
  createProductUseCase: CreateProductUseCase;
  listProductsUseCase: ListProductsUseCase;
  getProductByIdUseCase: GetProductByIdUseCase;
  updateProductUseCase: UpdateProductUseCase;
  deleteProductUseCase: DeleteProductUseCase;
  activateProductUseCase: ActivateProductUseCase;
  deactivateProductUseCase: DeactivateProductUseCase;
  uploadProductCoverImageUseCase: UploadProductCoverImageUseCase;
  removeProductCoverImageUseCase: RemoveProductCoverImageUseCase;
  // Exposed so the presentation layer can resolve a fresh, presigned URL for the
  // stored cover image key when building product responses.
  coverImageStorage: ProductImageStorageService;
}

export function makeProductUseCases(prisma: PrismaService): ProductUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const organizationRepository = new PrismaOrganizationRepository(transactionManager);
  const productRepository = new PrismaProductRepository(transactionManager);
  const coverImageStorage = new CloudflareR2ProductImageStorageService({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    signedUrlExpiresInSeconds: env.R2_PRESIGNED_URL_EXPIRES_IN,
  });

  return {
    createProductUseCase: new CreateProductUseCase({
      organizationRepository,
      productRepository,
      unitOfWork: transactionManager,
    }),
    listProductsUseCase: new ListProductsUseCase(productRepository),
    getProductByIdUseCase: new GetProductByIdUseCase(productRepository),
    updateProductUseCase: new UpdateProductUseCase({
      productRepository,
      unitOfWork: transactionManager,
    }),
    deleteProductUseCase: new DeleteProductUseCase({
      productRepository,
      unitOfWork: transactionManager,
    }),
    activateProductUseCase: new ActivateProductUseCase({
      productRepository,
      unitOfWork: transactionManager,
    }),
    deactivateProductUseCase: new DeactivateProductUseCase({
      productRepository,
      unitOfWork: transactionManager,
    }),
    uploadProductCoverImageUseCase: new UploadProductCoverImageUseCase({
      productRepository,
      storageService: coverImageStorage,
      unitOfWork: transactionManager,
    }),
    removeProductCoverImageUseCase: new RemoveProductCoverImageUseCase({
      productRepository,
      storageService: coverImageStorage,
      unitOfWork: transactionManager,
    }),
    coverImageStorage,
  };
}
