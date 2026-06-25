import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import type { OrganizationDocumentPatientApprovalRepository } from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { OrganizationRequiredDocumentRepository } from "../repositories/OrganizationRequiredDocumentRepository.js";

export interface ApprovePatientRegistrationInput {
  organizationId: string;
  patientId: string;
}

export interface ApprovePatientRegistrationDependencies {
  patientRepository: PatientRepository;
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
  unitOfWork: UnitOfWork;
}

export class ApprovePatientRegistrationUseCase {
  constructor(private readonly deps: ApprovePatientRegistrationDependencies) {}

  async execute(input: ApprovePatientRegistrationInput): Promise<PatientReadModel> {
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    const requiredDocuments = await this.deps.requiredDocumentRepository.findAllByOrganization(
      input.organizationId,
    );
    const approvals = await this.deps.approvalRepository.findAllByPatientInOrganization(
      input.organizationId,
      input.patientId,
    );

    const approvedDocumentIds = new Set(
      approvals
        .filter((approval) => approval.status === DocumentApprovalStatus.Approved)
        .map((approval) => approval.documentId),
    );
    const everyDocumentApproved =
      requiredDocuments.length > 0 &&
      requiredDocuments.every((document) => approvedDocumentIds.has(document.id));

    if (!everyDocumentApproved) {
      throw new ConflictError(
        "All required documents must be approved before approving the registration.",
      );
    }

    patient.approveRegistration();

    await this.deps.unitOfWork.execute(() => this.deps.patientRepository.save(patient));

    const updated = await this.deps.patientRepository.findDetailsByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!updated) {
      throw new NotFoundError("Patient not found.");
    }

    return updated;
  }
}
