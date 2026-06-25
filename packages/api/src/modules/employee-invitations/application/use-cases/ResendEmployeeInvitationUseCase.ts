import type { EmailService } from "../../../../shared/application/email/EmailService.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { buildInvitationEmail } from "../employee-invitation-email.js";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
} from "../repositories/EmployeeInvitationRepository.js";

export interface ResendEmployeeInvitationInput {
  organizationId: string;
  invitationId: string;
}

export interface ResendEmployeeInvitationDependencies {
  invitationRepository: EmployeeInvitationRepository;
  emailService: EmailService;
  unitOfWork: UnitOfWork;
  webAppUrl: string;
}

export class ResendEmployeeInvitationUseCase {
  constructor(private readonly deps: ResendEmployeeInvitationDependencies) {}

  async execute(input: ResendEmployeeInvitationInput): Promise<EmployeeInvitationReadModel> {
    const invitation = await this.deps.invitationRepository.findByIdInOrganization(
      input.organizationId,
      input.invitationId,
    );
    if (!invitation) {
      throw new NotFoundError("Invitation not found.");
    }

    // Throws a DomainValidationError when the invitation was already accepted.
    invitation.resend();

    const readModel = await this.deps.unitOfWork.execute(() =>
      this.deps.invitationRepository.save(invitation),
    );

    const acceptUrl = `${this.deps.webAppUrl}/convite/${invitation.token}`;
    await this.deps.emailService.send(
      buildInvitationEmail({ to: invitation.email, acceptUrl }),
    );

    return readModel;
  }
}
