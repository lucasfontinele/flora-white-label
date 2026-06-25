import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import type { OrganizationDocumentApprovalLogRepository } from "../repositories/OrganizationDocumentApprovalLogRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";

export interface RejectPatientDocumentInput {
  organizationId: string;
  patientId: string;
  approvalId: string;
  organizationUserId: string;
  rejectedReason: string;
}

export interface RejectPatientDocumentDependencies {
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
  logRepository: OrganizationDocumentApprovalLogRepository;
  unitOfWork: UnitOfWork;
}

export class RejectPatientDocumentUseCase {
  constructor(private readonly deps: RejectPatientDocumentDependencies) {}

  async execute(input: RejectPatientDocumentInput): Promise<OrganizationDocumentPatientApprovalReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const approval = await this.deps.approvalRepository.findByIdForPatientInOrganization(
        input.organizationId,
        input.patientId,
        input.approvalId,
      );
      if (!approval) {
        throw new NotFoundError("Patient document approval not found.");
      }

      const action = approval.reject(input.rejectedReason);
      const output = await this.deps.approvalRepository.save(approval);
      const log = OrganizationDocumentApprovalLog.create({
        action,
        patientApprovalId: approval.id,
        organizationUserId: input.organizationUserId,
      });
      await this.deps.logRepository.create(log);

      return output;
    });
  }
}
