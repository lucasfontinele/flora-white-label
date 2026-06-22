import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  OrganizationDocumentApprovalLogReadModel,
  OrganizationDocumentApprovalLogRepository,
} from "../repositories/OrganizationDocumentApprovalLogRepository.js";
import type { OrganizationDocumentPatientApprovalRepository } from "../repositories/OrganizationDocumentPatientApprovalRepository.js";

export interface ListPatientDocumentApprovalLogsInput {
  organizationId: string;
  patientId: string;
  approvalId: string;
}

export interface ListPatientDocumentApprovalLogsOutput {
  data: OrganizationDocumentApprovalLogReadModel[];
}

export class ListPatientDocumentApprovalLogsUseCase {
  constructor(
    private readonly deps: {
      approvalRepository: OrganizationDocumentPatientApprovalRepository;
      logRepository: OrganizationDocumentApprovalLogRepository;
    },
  ) {}

  async execute(
    input: ListPatientDocumentApprovalLogsInput,
  ): Promise<ListPatientDocumentApprovalLogsOutput> {
    const approval = await this.deps.approvalRepository.findByIdForPatientInOrganization(
      input.organizationId,
      input.patientId,
      input.approvalId,
    );
    if (!approval) {
      throw new NotFoundError("Patient document approval not found.");
    }

    const data = await this.deps.logRepository.findAllByPatientApproval(approval.id);

    return { data };
  }
}
