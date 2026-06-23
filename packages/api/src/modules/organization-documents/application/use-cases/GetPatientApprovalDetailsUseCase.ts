import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type {
  OrganizationRequiredDocumentReadModel,
  OrganizationRequiredDocumentRepository,
} from "../repositories/OrganizationRequiredDocumentRepository.js";
import type { DocumentStorageService } from "../services/DocumentStorageService.js";

export interface GetPatientApprovalDetailsInput {
  organizationId: string;
  patientId: string;
}

export interface GetPatientApprovalDetailsOutput {
  patient: PatientReadModel;
  requiredDocuments: OrganizationRequiredDocumentReadModel[];
  approvals: OrganizationDocumentPatientApprovalReadModel[];
}

export interface GetPatientApprovalDetailsDependencies {
  patientRepository: PatientRepository;
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
  storageService: DocumentStorageService;
}

export class GetPatientApprovalDetailsUseCase {
  constructor(private readonly deps: GetPatientApprovalDetailsDependencies) {}

  async execute(input: GetPatientApprovalDetailsInput): Promise<GetPatientApprovalDetailsOutput> {
    const patient = await this.deps.patientRepository.findDetailsByIdInOrganization(
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

    return {
      patient,
      requiredDocuments,
      approvals: await Promise.all(
        approvals.map(async (approval) => ({
          ...approval,
          fileUrl: approval.storageKey
            ? await this.deps.storageService.getDownloadUrl(approval.storageKey)
            : null,
        })),
      ),
    };
  }
}
