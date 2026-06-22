import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import type { OrganizationDocumentApprovalLogRepository } from "../repositories/OrganizationDocumentApprovalLogRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { DocumentStorageService } from "../services/DocumentStorageService.js";

export interface UploadPatientDocumentInput {
  organizationId: string;
  patientId: string;
  approvalId: string;
  fileName: string;
  mimeType: string;
  size: number;
  content: Uint8Array;
  performedByUserId?: string;
}

export interface UploadPatientDocumentDependencies {
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
  logRepository: OrganizationDocumentApprovalLogRepository;
  storageService: DocumentStorageService;
  unitOfWork: UnitOfWork;
  now?: () => Date;
}

export class UploadPatientDocumentUseCase {
  constructor(private readonly deps: UploadPatientDocumentDependencies) {}

  async execute(
    input: UploadPatientDocumentInput,
  ): Promise<OrganizationDocumentPatientApprovalReadModel> {
    const approval = await this.deps.approvalRepository.findByIdForPatientInOrganization(
      input.organizationId,
      input.patientId,
      input.approvalId,
    );
    if (!approval) {
      throw new NotFoundError("Patient document approval not found.");
    }

    const storageKey = buildStorageKey({
      organizationId: input.organizationId,
      patientId: input.patientId,
      approvalId: input.approvalId,
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

    return this.deps.unitOfWork.execute(async () => {
      const action = approval.attachUploadedFile({
        fileName: input.fileName,
        mimeType: upload.mimeType,
        size: upload.size,
        storageKey: upload.storageKey,
      });
      const output = await this.deps.approvalRepository.save(approval);
      const log = OrganizationDocumentApprovalLog.create({
        action,
        patientApprovalId: approval.id,
        organizationUserId: normalizeActorId(input.performedByUserId, input.patientId),
      });
      await this.deps.logRepository.create(log);

      return output;
    });
  }
}

function buildStorageKey(input: {
  organizationId: string;
  patientId: string;
  approvalId: string;
  fileName: string;
  timestamp: number;
}): string {
  return [
    "organizations",
    input.organizationId,
    "patients",
    input.patientId,
    "documents",
    input.approvalId,
    `${input.timestamp}-${safeFileName(input.fileName)}`,
  ].join("/");
}

function safeFileName(fileName: string): string {
  const normalized = fileName
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return normalized.length > 0 ? normalized : "document";
}

function normalizeActorId(performedByUserId: string | undefined, patientId: string): string {
  const trimmed = performedByUserId?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : patientId;
}

