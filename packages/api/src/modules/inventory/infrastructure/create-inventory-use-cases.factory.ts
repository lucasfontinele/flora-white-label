import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaProductRepository } from "../../products/infrastructure/prisma/PrismaProductRepository.js";
import { AddStockUseCase } from "../application/use-cases/AddStockUseCase.js";
import { AdjustStockUseCase } from "../application/use-cases/AdjustStockUseCase.js";
import { ConfirmStockOutUseCase } from "../application/use-cases/ConfirmStockOutUseCase.js";
import { CreateInventoryItemUseCase } from "../application/use-cases/CreateInventoryItemUseCase.js";
import { GetInventoryItemUseCase } from "../application/use-cases/GetInventoryItemUseCase.js";
import { ListInventoryMovementsUseCase } from "../application/use-cases/ListInventoryMovementsUseCase.js";
import { ReleaseReservationUseCase } from "../application/use-cases/ReleaseReservationUseCase.js";
import { ReserveStockUseCase } from "../application/use-cases/ReserveStockUseCase.js";
import { PrismaInventoryItemRepository } from "./prisma/PrismaInventoryItemRepository.js";
import { PrismaInventoryMovementRepository } from "./prisma/PrismaInventoryMovementRepository.js";

export interface InventoryUseCases {
  createInventoryItemUseCase: CreateInventoryItemUseCase;
  getInventoryItemUseCase: GetInventoryItemUseCase;
  addStockUseCase: AddStockUseCase;
  reserveStockUseCase: ReserveStockUseCase;
  releaseReservationUseCase: ReleaseReservationUseCase;
  confirmStockOutUseCase: ConfirmStockOutUseCase;
  adjustStockUseCase: AdjustStockUseCase;
  listInventoryMovementsUseCase: ListInventoryMovementsUseCase;
}

export function makeInventoryUseCases(prisma: PrismaService): InventoryUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const productRepository = new PrismaProductRepository(transactionManager);
  const inventoryItemRepository = new PrismaInventoryItemRepository(transactionManager);
  const inventoryMovementRepository = new PrismaInventoryMovementRepository(transactionManager);

  const operationDependencies = {
    inventoryItemRepository,
    inventoryMovementRepository,
    unitOfWork: transactionManager,
  };

  return {
    createInventoryItemUseCase: new CreateInventoryItemUseCase({
      productRepository,
      inventoryItemRepository,
      inventoryMovementRepository,
      unitOfWork: transactionManager,
    }),
    getInventoryItemUseCase: new GetInventoryItemUseCase(inventoryItemRepository),
    addStockUseCase: new AddStockUseCase(operationDependencies),
    reserveStockUseCase: new ReserveStockUseCase(operationDependencies),
    releaseReservationUseCase: new ReleaseReservationUseCase(operationDependencies),
    confirmStockOutUseCase: new ConfirmStockOutUseCase(operationDependencies),
    adjustStockUseCase: new AdjustStockUseCase(operationDependencies),
    listInventoryMovementsUseCase: new ListInventoryMovementsUseCase({
      inventoryItemRepository,
      inventoryMovementRepository,
    }),
  };
}
