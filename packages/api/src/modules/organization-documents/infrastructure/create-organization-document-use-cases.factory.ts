import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { PrismaPatientRepository } from "../../patients/infrastructure/prisma/PrismaPatientRepository.js";
import { ApprovePatientDocumentUseCase } from "../application/use-cases/ApprovePatientDocumentUseCase.js";
import { CreateOrganizationRequiredDocumentUseCase } from "../application/use-cases/CreateOrganizationRequiredDocumentUseCase.js";
import { CreatePatientDocumentApprovalUseCase } from "../application/use-cases/CreatePatientDocumentApprovalUseCase.js";
import { DeleteOrganizationRequiredDocumentUseCase } from "../application/use-cases/DeleteOrganizationRequiredDocumentUseCase.js";
import { ListOrganizationRequiredDocumentsUseCase } from "../application/use-cases/ListOrganizationRequiredDocumentsUseCase.js";
import { ListPatientDocumentApprovalLogsUseCase } from "../application/use-cases/ListPatientDocumentApprovalLogsUseCase.js";
import { ListPatientDocumentApprovalsUseCase } from "../application/use-cases/ListPatientDocumentApprovalsUseCase.js";
import { RejectPatientDocumentUseCase } from "../application/use-cases/RejectPatientDocumentUseCase.js";
import { ResetPatientDocumentToPendingUseCase } from "../application/use-cases/ResetPatientDocumentToPendingUseCase.js";
import { UpdateOrganizationRequiredDocumentUseCase } from "../application/use-cases/UpdateOrganizationRequiredDocumentUseCase.js";
import { PrismaOrganizationDocumentApprovalLogRepository } from "./prisma/PrismaOrganizationDocumentApprovalLogRepository.js";
import { PrismaOrganizationDocumentPatientApprovalRepository } from "./prisma/PrismaOrganizationDocumentPatientApprovalRepository.js";
import { PrismaOrganizationRequiredDocumentRepository } from "./prisma/PrismaOrganizationRequiredDocumentRepository.js";

export interface OrganizationDocumentUseCases {
  createOrganizationRequiredDocumentUseCase: CreateOrganizationRequiredDocumentUseCase;
  listOrganizationRequiredDocumentsUseCase: ListOrganizationRequiredDocumentsUseCase;
  updateOrganizationRequiredDocumentUseCase: UpdateOrganizationRequiredDocumentUseCase;
  deleteOrganizationRequiredDocumentUseCase: DeleteOrganizationRequiredDocumentUseCase;
  createPatientDocumentApprovalUseCase: CreatePatientDocumentApprovalUseCase;
  listPatientDocumentApprovalsUseCase: ListPatientDocumentApprovalsUseCase;
  approvePatientDocumentUseCase: ApprovePatientDocumentUseCase;
  rejectPatientDocumentUseCase: RejectPatientDocumentUseCase;
  resetPatientDocumentToPendingUseCase: ResetPatientDocumentToPendingUseCase;
  listPatientDocumentApprovalLogsUseCase: ListPatientDocumentApprovalLogsUseCase;
}

export function makeOrganizationDocumentUseCases(
  prisma: PrismaService,
): OrganizationDocumentUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const organizationRepository = new PrismaOrganizationRepository(transactionManager);
  const patientRepository = new PrismaPatientRepository(transactionManager);
  const requiredDocumentRepository = new PrismaOrganizationRequiredDocumentRepository(
    transactionManager,
  );
  const approvalRepository = new PrismaOrganizationDocumentPatientApprovalRepository(
    transactionManager,
  );
  const logRepository = new PrismaOrganizationDocumentApprovalLogRepository(transactionManager);

  return {
    createOrganizationRequiredDocumentUseCase: new CreateOrganizationRequiredDocumentUseCase({
      organizationRepository,
      requiredDocumentRepository,
      unitOfWork: transactionManager,
    }),
    listOrganizationRequiredDocumentsUseCase: new ListOrganizationRequiredDocumentsUseCase(
      requiredDocumentRepository,
    ),
    updateOrganizationRequiredDocumentUseCase: new UpdateOrganizationRequiredDocumentUseCase({
      requiredDocumentRepository,
      unitOfWork: transactionManager,
    }),
    deleteOrganizationRequiredDocumentUseCase: new DeleteOrganizationRequiredDocumentUseCase({
      requiredDocumentRepository,
      unitOfWork: transactionManager,
    }),
    createPatientDocumentApprovalUseCase: new CreatePatientDocumentApprovalUseCase({
      organizationRepository,
      patientRepository,
      requiredDocumentRepository,
      approvalRepository,
    }),
    listPatientDocumentApprovalsUseCase: new ListPatientDocumentApprovalsUseCase({
      patientRepository,
      approvalRepository,
    }),
    approvePatientDocumentUseCase: new ApprovePatientDocumentUseCase({
      approvalRepository,
      logRepository,
      unitOfWork: transactionManager,
    }),
    rejectPatientDocumentUseCase: new RejectPatientDocumentUseCase({
      approvalRepository,
      logRepository,
      unitOfWork: transactionManager,
    }),
    resetPatientDocumentToPendingUseCase: new ResetPatientDocumentToPendingUseCase({
      approvalRepository,
      logRepository,
      unitOfWork: transactionManager,
    }),
    listPatientDocumentApprovalLogsUseCase: new ListPatientDocumentApprovalLogsUseCase({
      approvalRepository,
      logRepository,
    }),
  };
}
