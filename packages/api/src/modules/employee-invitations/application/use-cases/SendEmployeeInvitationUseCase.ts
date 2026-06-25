import type { EmailService } from "../../../../shared/application/email/EmailService.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { RoleRepository } from "../../../access-control/application/repositories/RoleRepository.js";
import { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import { buildInvitationEmail } from "../employee-invitation-email.js";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
} from "../repositories/EmployeeInvitationRepository.js";

export interface SendEmployeeInvitationInput {
  organizationId: string;
  email: string;
  roleId: string;
  invitedByUserId?: string | null;
}

export interface SendEmployeeInvitationDependencies {
  invitationRepository: EmployeeInvitationRepository;
  roleRepository: RoleRepository;
  emailService: EmailService;
  unitOfWork: UnitOfWork;
  webAppUrl: string;
}

export class SendEmployeeInvitationUseCase {
  constructor(private readonly deps: SendEmployeeInvitationDependencies) {}

  async execute(input: SendEmployeeInvitationInput): Promise<EmployeeInvitationReadModel> {
    const role = await this.deps.roleRepository.findByIdInOrganization(
      input.organizationId,
      input.roleId,
    );
    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    if (role.fullAccess) {
      throw new DomainValidationError("Cannot invite an employee to a full-access role.");
    }

    const email = input.email.trim().toLowerCase();

    // Reuse an existing pending invitation for the same email (resend semantics)
    // instead of piling up duplicates.
    const existing = await this.deps.invitationRepository.findActivePendingByEmail(
      input.organizationId,
      email,
    );

    const invitation =
      existing ??
      EmployeeInvitation.create({
        organizationId: input.organizationId,
        email,
        roleId: input.roleId,
        invitedByUserId: input.invitedByUserId,
      });

    if (existing) {
      existing.resend();
    }

    const readModel = await this.deps.unitOfWork.execute(() =>
      existing
        ? this.deps.invitationRepository.save(invitation)
        : this.deps.invitationRepository.create(invitation),
    );

    await this.sendEmail(invitation.email, invitation.token);

    return readModel;
  }

  private async sendEmail(email: string, token: string): Promise<void> {
    const acceptUrl = `${this.deps.webAppUrl}/convite/${token}`;
    await this.deps.emailService.send(buildInvitationEmail({ to: email, acceptUrl }));
  }
}
