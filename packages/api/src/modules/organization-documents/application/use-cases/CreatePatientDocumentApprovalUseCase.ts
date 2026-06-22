import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import { OrganizationDocumentPatientApproval } from "../../domain/entities/OrganizationDocumentPatientApproval.js";
import type { OrganizationRequiredDocumentRepository } from "../repositories/OrganizationRequiredDocumentRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";

export interface CreatePatientDocumentApprovalInput {
  organizationId: string;
  patientId: string;
  documentId: string;
}

export interface CreatePatientDocumentApprovalDependencies {
  organizationRepository: OrganizationRepository;
  patientRepository: PatientRepository;
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
}

export class CreatePatientDocumentApprovalUseCase {
  constructor(private readonly deps: CreatePatientDocumentApprovalDependencies) {}

  async execute(
    input: CreatePatientDocumentApprovalInput,
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

    const duplicated = await this.deps.approvalRepository.findByDocumentAndPatient(
      input.documentId,
      input.patientId,
    );
    if (duplicated) {
      throw new ConflictError("Patient document approval already exists.");
    }

    const approval = OrganizationDocumentPatientApproval.create({
      documentId: input.documentId,
      patientId: input.patientId,
    });

    return this.deps.approvalRepository.create(approval);
  }
}
