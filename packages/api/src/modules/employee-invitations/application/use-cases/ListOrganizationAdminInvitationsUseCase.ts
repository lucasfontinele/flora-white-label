import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import type { MasterAccessRepository } from "../../../master-reports/application/repositories/MasterAccessRepository.js";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
} from "../repositories/EmployeeInvitationRepository.js";

export interface ListOrganizationAdminInvitationsInput {
  /** Identity of the requester, taken from the `x-master-user-id` header. */
  requesterUserId: string;
  organizationId: string;
}

export interface ListOrganizationAdminInvitationsOutput {
  data: EmployeeInvitationReadModel[];
}

export interface ListOrganizationAdminInvitationsDependencies {
  masterAccessRepository: MasterAccessRepository;
  invitationRepository: EmployeeInvitationRepository;
}

/**
 * Lists the master-admin invitations of an organization (full-access role).
 * Restricted to Master users, mirroring the send use case.
 */
export class ListOrganizationAdminInvitationsUseCase {
  constructor(private readonly deps: ListOrganizationAdminInvitationsDependencies) {}

  async execute(
    input: ListOrganizationAdminInvitationsInput,
  ): Promise<ListOrganizationAdminInvitationsOutput> {
    const userId = input.requesterUserId.trim();
    if (userId.length === 0 || !(await this.deps.masterAccessRepository.isMaster(userId))) {
      throw new ForbiddenError("Acesso restrito a usuários master.");
    }

    const data = await this.deps.invitationRepository.findFullAccessByOrganization(
      input.organizationId,
    );

    return { data };
  }
}
