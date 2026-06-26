import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { env } from "../../../config/env.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { PrismaPatientRepository } from "../../patients/infrastructure/prisma/PrismaPatientRepository.js";
import { PrismaPatientPrescriptionRepository } from "../../prescriptions/infrastructure/prisma/PrismaPatientPrescriptionRepository.js";
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
import { UploadPatientDocumentUseCase } from "../application/use-cases/UploadPatientDocumentUseCase.js";
import { UploadPatientRequiredDocumentUseCase } from "../application/use-cases/UploadPatientRequiredDocumentUseCase.js";
import { ListOrganizationPatientsUseCase } from "../application/use-cases/ListOrganizationPatientsUseCase.js";
import { GetPatientApprovalDetailsUseCase } from "../application/use-cases/GetPatientApprovalDetailsUseCase.js";
import { ApprovePatientRegistrationUseCase } from "../application/use-cases/ApprovePatientRegistrationUseCase.js";
import { RejectPatientRegistrationUseCase } from "../application/use-cases/RejectPatientRegistrationUseCase.js";
import { PrismaOrganizationDocumentApprovalLogRepository } from "./prisma/PrismaOrganizationDocumentApprovalLogRepository.js";
import { PrismaOrganizationDocumentPatientApprovalRepository } from "./prisma/PrismaOrganizationDocumentPatientApprovalRepository.js";
import { PrismaOrganizationRequiredDocumentRepository } from "./prisma/PrismaOrganizationRequiredDocumentRepository.js";
import { CloudflareR2DocumentStorageService } from "./storage/CloudflareR2DocumentStorageService.js";

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
  uploadPatientDocumentUseCase: UploadPatientDocumentUseCase;
  uploadPatientRequiredDocumentUseCase: UploadPatientRequiredDocumentUseCase;
  listPatientDocumentApprovalLogsUseCase: ListPatientDocumentApprovalLogsUseCase;
  listOrganizationPatientsUseCase: ListOrganizationPatientsUseCase;
  getPatientApprovalDetailsUseCase: GetPatientApprovalDetailsUseCase;
  approvePatientRegistrationUseCase: ApprovePatientRegistrationUseCase;
  rejectPatientRegistrationUseCase: RejectPatientRegistrationUseCase;
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
  const prescriptionRepository = new PrismaPatientPrescriptionRepository(transactionManager);
  const storageService = new CloudflareR2DocumentStorageService({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    signedUrlExpiresInSeconds: env.R2_PRESIGNED_URL_EXPIRES_IN,
  });

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
      storageService,
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
    uploadPatientDocumentUseCase: new UploadPatientDocumentUseCase({
      approvalRepository,
      logRepository,
      storageService,
      unitOfWork: transactionManager,
    }),
    uploadPatientRequiredDocumentUseCase: new UploadPatientRequiredDocumentUseCase({
      organizationRepository,
      patientRepository,
      requiredDocumentRepository,
      approvalRepository,
      logRepository,
      storageService,
      unitOfWork: transactionManager,
    }),
    listPatientDocumentApprovalLogsUseCase: new ListPatientDocumentApprovalLogsUseCase({
      approvalRepository,
      logRepository,
    }),
    listOrganizationPatientsUseCase: new ListOrganizationPatientsUseCase({ patientRepository }),
    getPatientApprovalDetailsUseCase: new GetPatientApprovalDetailsUseCase({
      patientRepository,
      requiredDocumentRepository,
      approvalRepository,
      storageService,
    }),
    approvePatientRegistrationUseCase: new ApprovePatientRegistrationUseCase({
      patientRepository,
      requiredDocumentRepository,
      approvalRepository,
      prescriptionRepository,
      unitOfWork: transactionManager,
    }),
    rejectPatientRegistrationUseCase: new RejectPatientRegistrationUseCase({
      patientRepository,
      unitOfWork: transactionManager,
    }),
  };
}
