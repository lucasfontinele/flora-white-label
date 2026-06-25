import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
} from "../repositories/EmployeeInvitationRepository.js";

export interface ListEmployeeInvitationsInput {
  organizationId: string;
}

export interface ListEmployeeInvitationsOutput {
  data: EmployeeInvitationReadModel[];
}

export class ListEmployeeInvitationsUseCase {
  constructor(private readonly invitationRepository: EmployeeInvitationRepository) {}

  async execute(input: ListEmployeeInvitationsInput): Promise<ListEmployeeInvitationsOutput> {
    const data = await this.invitationRepository.findAllByOrganization(input.organizationId);

    return { data };
  }
}
