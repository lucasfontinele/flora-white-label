import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import { OrganizationDocumentPatientApproval } from "../../domain/entities/OrganizationDocumentPatientApproval.js";
import type { OrganizationDocumentApprovalLogRepository } from "../repositories/OrganizationDocumentApprovalLogRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { OrganizationRequiredDocumentRepository } from "../repositories/OrganizationRequiredDocumentRepository.js";
import type { DocumentStorageService } from "../services/DocumentStorageService.js";
import {
  buildPatientDocumentStorageKey,
  normalizeUploadActorId,
} from "./patient-document-upload.helpers.js";

export interface UploadPatientRequiredDocumentInput {
  organizationId: string;
  patientId: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  content: Uint8Array;
  performedByUserId?: string;
}

export interface UploadPatientRequiredDocumentDependencies {
  organizationRepository: OrganizationRepository;
  patientRepository: PatientRepository;
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
  logRepository: OrganizationDocumentApprovalLogRepository;
  storageService: DocumentStorageService;
  unitOfWork: UnitOfWork;
  now?: () => Date;
}

/**
 * Patient-facing single-call upload: given a required document, ensures the
 * patient's approval exists (creating it on first upload), stores the file, and
 * records it as PENDING for the organization to review. Re-uploading a rejected
 * document moves it back to PENDING.
 */
export class UploadPatientRequiredDocumentUseCase {
  constructor(private readonly deps: UploadPatientRequiredDocumentDependencies) {}

  async execute(
    input: UploadPatientRequiredDocumentInput,
  ): Promise<OrganizationDocumentPatientApprovalReadModel> {
    const organization = await this.deps.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    const document = await this.deps.requiredDocumentRepository.findByIdInOrganization(
      input.organizationId,
      input.documentId,
    );
    if (!document) {
      throw new NotFoundError("Required document not found.");
    }

    const existing = await this.deps.approvalRepository.findByDocumentAndPatient(
      input.documentId,
      input.patientId,
    );
    const isNew = existing === null;
    const approval =
      existing ??
      OrganizationDocumentPatientApproval.create({
        organizationId: input.organizationId,
        documentId: input.documentId,
        patientId: input.patientId,
      });

    const storageKey = buildPatientDocumentStorageKey({
      organizationId: input.organizationId,
      patientId: input.patientId,
      approvalId: approval.id,
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
      const output = isNew
        ? await this.deps.approvalRepository.create(approval)
        : await this.deps.approvalRepository.save(approval);
      const log = OrganizationDocumentApprovalLog.create({
        action,
        patientApprovalId: approval.id,
        organizationUserId: normalizeUploadActorId(input.performedByUserId, input.patientId),
      });
      await this.deps.logRepository.create(log);

      // Once every required document has been uploaded, move the patient into the
      // organization's approval queue.
      if (patient.patientStatus === PatientStatus.WaitingDocuments) {
        const requiredDocuments = await this.deps.requiredDocumentRepository.findAllByOrganization(
          input.organizationId,
        );
        const approvals = await this.deps.approvalRepository.findAllByPatientInOrganization(
          input.organizationId,
          input.patientId,
        );
        const uploadedDocumentIds = new Set([
          ...approvals.map((item) => item.documentId),
          input.documentId,
        ]);
        const allUploaded =
          requiredDocuments.length > 0 &&
          requiredDocuments.every((required) => uploadedDocumentIds.has(required.id));

        if (allUploaded) {
          patient.submitForApproval();
          await this.deps.patientRepository.save(patient);
        }
      }

      return output;
    });
  }
}
