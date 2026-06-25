import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { DocumentStorageService } from "../services/DocumentStorageService.js";

export interface ListPatientDocumentApprovalsInput {
  organizationId: string;
  patientId: string;
}

export interface ListPatientDocumentApprovalsOutput {
  data: OrganizationDocumentPatientApprovalReadModel[];
}

export class ListPatientDocumentApprovalsUseCase {
  constructor(
    private readonly deps: {
      patientRepository: PatientRepository;
      approvalRepository: OrganizationDocumentPatientApprovalRepository;
      storageService: DocumentStorageService;
    },
  ) {}

  async execute(input: ListPatientDocumentApprovalsInput): Promise<ListPatientDocumentApprovalsOutput> {
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    const data = await this.deps.approvalRepository.findAllByPatientInOrganization(
      input.organizationId,
      input.patientId,
    );

    return {
      data: await Promise.all(
        data.map(async (approval) => ({
          ...approval,
          fileUrl: approval.storageKey
            ? await this.deps.storageService.getDownloadUrl(approval.storageKey)
            : null,
        })),
      ),
    };
  }
}
