import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  EmployeeInvitationTokenReadModel,
  EmployeeInvitationRepository,
} from "../repositories/EmployeeInvitationRepository.js";

export interface GetEmployeeInvitationByTokenInput {
  token: string;
}

export class GetEmployeeInvitationByTokenUseCase {
  constructor(private readonly invitationRepository: EmployeeInvitationRepository) {}

  async execute(
    input: GetEmployeeInvitationByTokenInput,
  ): Promise<EmployeeInvitationTokenReadModel> {
    const invitation = await this.invitationRepository.findDetailsByToken(input.token);

    if (!invitation) {
      throw new NotFoundError("Invitation not found.");
    }

    return invitation;
  }
}
