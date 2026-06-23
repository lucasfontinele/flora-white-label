import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { ActivateProductUseCase } from "../application/use-cases/ActivateProductUseCase.js";
import { CreateProductUseCase } from "../application/use-cases/CreateProductUseCase.js";
import { DeactivateProductUseCase } from "../application/use-cases/DeactivateProductUseCase.js";
import { DeleteProductUseCase } from "../application/use-cases/DeleteProductUseCase.js";
import { GetProductByIdUseCase } from "../application/use-cases/GetProductByIdUseCase.js";
import { ListProductsUseCase } from "../application/use-cases/ListProductsUseCase.js";
import { UpdateProductUseCase } from "../application/use-cases/UpdateProductUseCase.js";
import { PrismaProductRepository } from "./prisma/PrismaProductRepository.js";

export interface ProductUseCases {
  createProductUseCase: CreateProductUseCase;
  listProductsUseCase: ListProductsUseCase;
  getProductByIdUseCase: GetProductByIdUseCase;
  updateProductUseCase: UpdateProductUseCase;
  deleteProductUseCase: DeleteProductUseCase;
  activateProductUseCase: ActivateProductUseCase;
  deactivateProductUseCase: DeactivateProductUseCase;
}

export function makeProductUseCases(prisma: PrismaService): ProductUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const organizationRepository = new PrismaOrganizationRepository(transactionManager);
  const productRepository = new PrismaProductRepository(transactionManager);

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
  };
}
