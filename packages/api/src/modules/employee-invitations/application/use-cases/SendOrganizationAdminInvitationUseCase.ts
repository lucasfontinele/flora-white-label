import type { EmailService } from "../../../../shared/application/email/EmailService.js";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { MasterAccessRepository } from "../../../master-reports/application/repositories/MasterAccessRepository.js";
import type { RoleRepository } from "../../../access-control/application/repositories/RoleRepository.js";
import {
  DEFAULT_ROLE_TEMPLATES,
  SUPER_ADMIN_ROLE_TEMPLATE,
  type DefaultRoleTemplate,
} from "../../../access-control/domain/default-roles.js";
import { Role } from "../../../access-control/domain/entities/Role.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import { buildOrganizationAdminInvitationEmail } from "../organization-admin-invitation-email.js";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
} from "../repositories/EmployeeInvitationRepository.js";

export interface SendOrganizationAdminInvitationInput {
  /** Identity of the requester, taken from the `x-master-user-id` header. */
  requesterUserId: string;
  organizationId: string;
  email: string;
}

export interface SendOrganizationAdminInvitationDependencies {
  masterAccessRepository: MasterAccessRepository;
  organizationRepository: OrganizationRepository;
  roleRepository: RoleRepository;
  invitationRepository: EmployeeInvitationRepository;
  emailService: EmailService;
  unitOfWork: UnitOfWork;
  webAppUrl: string;
}

/**
 * Invites the master administrator of an organization from the master
 * backoffice. The invitee, once accepted, becomes an Organization user bound to
 * the `SUPER_ADMIN` (full-access) role — total access to the organization
 * panel, including managing permissions.
 *
 * Access is restricted to Master users (the platform operators); anyone else
 * gets a 403. Because organizations created through the master backoffice are
 * not seeded with access roles, this use case provisions the full default role
 * set (idempotently) before issuing the invitation.
 */
export class SendOrganizationAdminInvitationUseCase {
  constructor(private readonly deps: SendOrganizationAdminInvitationDependencies) {}

  async execute(
    input: SendOrganizationAdminInvitationInput,
  ): Promise<EmployeeInvitationReadModel> {
    await this.assertMaster(input.requesterUserId);

    const organization = await this.deps.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const superAdminRole = await this.ensureDefaultRoles(input.organizationId);

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
        roleId: superAdminRole.id,
      });

    if (existing) {
      existing.resend();
    }

    const readModel = await this.deps.unitOfWork.execute(() =>
      existing
        ? this.deps.invitationRepository.save(invitation)
        : this.deps.invitationRepository.create(invitation),
    );

    await this.sendEmail(invitation.email, invitation.token, organization.tradeName);

    return readModel;
  }

  private async assertMaster(requesterUserId: string): Promise<void> {
    const userId = requesterUserId.trim();
    if (userId.length === 0 || !(await this.deps.masterAccessRepository.isMaster(userId))) {
      throw new ForbiddenError("Acesso restrito a usuários master.");
    }
  }

  /**
   * Find-or-create the org's default access roles, returning the `SUPER_ADMIN`
   * role used for the invitation. Mirrors the idempotent seeding in
   * `prisma/seed.ts`.
   */
  private async ensureDefaultRoles(organizationId: string): Promise<Role> {
    let superAdminRole: Role | null = null;

    for (const template of [...DEFAULT_ROLE_TEMPLATES, SUPER_ADMIN_ROLE_TEMPLATE]) {
      const role = await this.ensureRole(organizationId, template);
      if (template.key === SUPER_ADMIN_ROLE_TEMPLATE.key) {
        superAdminRole = role;
      }
    }

    // Unreachable: SUPER_ADMIN_ROLE_TEMPLATE is always in the iterated list.
    if (!superAdminRole) {
      throw new NotFoundError("Super admin role could not be provisioned.");
    }

    return superAdminRole;
  }

  private async ensureRole(
    organizationId: string,
    template: DefaultRoleTemplate,
  ): Promise<Role> {
    const existing = await this.deps.roleRepository.findByKeyInOrganization(
      organizationId,
      template.key,
    );
    if (existing) {
      return existing;
    }

    const role = Role.create({
      organizationId,
      key: template.key,
      name: template.name,
      description: template.description,
      isSystem: template.isSystem,
      fullAccess: template.fullAccess,
      viewAll: template.viewAll,
      permissions: template.permissions,
    });

    await this.deps.roleRepository.create(role);

    return role;
  }

  private async sendEmail(
    email: string,
    token: string,
    organizationName: string,
  ): Promise<void> {
    const acceptUrl = `${this.deps.webAppUrl}/convite/${token}`;
    await this.deps.emailService.send(
      buildOrganizationAdminInvitationEmail({ to: email, acceptUrl, organizationName }),
    );
  }
}
