import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";

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

    return { data };
  }
}
