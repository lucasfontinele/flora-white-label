import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaOrderRepository } from "../../orders/infrastructure/prisma/PrismaOrderRepository.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { PrismaPatientRepository } from "../../patients/infrastructure/prisma/PrismaPatientRepository.js";
import { PrismaProductRepository } from "../../products/infrastructure/prisma/PrismaProductRepository.js";
import { DeletePatientPrescriptionUseCase } from "../application/use-cases/DeletePatientPrescriptionUseCase.js";
import { GetPatientPrescriptionUseCase } from "../application/use-cases/GetPatientPrescriptionUseCase.js";
import { GetPatientPurchaseLimitsUseCase } from "../application/use-cases/GetPatientPurchaseLimitsUseCase.js";
import { ListPatientPrescriptionsUseCase } from "../application/use-cases/ListPatientPrescriptionsUseCase.js";
import { UpsertPatientPrescriptionUseCase } from "../application/use-cases/UpsertPatientPrescriptionUseCase.js";
import { PrismaPatientPrescriptionRepository } from "./prisma/PrismaPatientPrescriptionRepository.js";

export interface PrescriptionUseCases {
  listPatientPrescriptionsUseCase: ListPatientPrescriptionsUseCase;
  getPatientPrescriptionUseCase: GetPatientPrescriptionUseCase;
  getPatientPurchaseLimitsUseCase: GetPatientPurchaseLimitsUseCase;
  upsertPatientPrescriptionUseCase: UpsertPatientPrescriptionUseCase;
  deletePatientPrescriptionUseCase: DeletePatientPrescriptionUseCase;
}

export function makePrescriptionUseCases(prisma: PrismaService): PrescriptionUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const organizationRepository = new PrismaOrganizationRepository(transactionManager);
  const patientRepository = new PrismaPatientRepository(transactionManager);
  const productRepository = new PrismaProductRepository(transactionManager);
  const orderRepository = new PrismaOrderRepository(transactionManager);
  const prescriptionRepository = new PrismaPatientPrescriptionRepository(transactionManager);

  return {
    listPatientPrescriptionsUseCase: new ListPatientPrescriptionsUseCase(prescriptionRepository),
    getPatientPrescriptionUseCase: new GetPatientPrescriptionUseCase(prescriptionRepository),
    getPatientPurchaseLimitsUseCase: new GetPatientPurchaseLimitsUseCase({
      prescriptionRepository,
      orderConsumptionRepository: orderRepository,
    }),
    upsertPatientPrescriptionUseCase: new UpsertPatientPrescriptionUseCase({
      organizationRepository,
      patientRepository,
      productRepository,
      prescriptionRepository,
      unitOfWork: transactionManager,
    }),
    deletePatientPrescriptionUseCase: new DeletePatientPrescriptionUseCase({
      prescriptionRepository,
      unitOfWork: transactionManager,
    }),
  };
}
