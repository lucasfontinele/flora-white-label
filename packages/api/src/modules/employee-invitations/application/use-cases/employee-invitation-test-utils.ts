import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { EmailMessage, EmailService } from "../../../../shared/application/email/EmailService.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { RoleReadModel, RoleRepository } from "../../../access-control/application/repositories/RoleRepository.js";
import { Role } from "../../../access-control/domain/entities/Role.js";
import type { OrganizationEmployeeRepository } from "../../../organization-employees/application/repositories/OrganizationEmployeeRepository.js";
import type { OrganizationEmployee } from "../../../organization-employees/domain/entities/OrganizationEmployee.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import type { User } from "../../../users/domain/entities/User.js";
import type { Email } from "../../../users/domain/value-objects/Email.js";
import { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import { InvitationStatus } from "../../domain/enums/InvitationStatus.js";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
  EmployeeInvitationTokenReadModel,
} from "../repositories/EmployeeInvitationRepository.js";

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

function toReadModel(invitation: EmployeeInvitation): EmployeeInvitationReadModel {
  return {
    id: invitation.id,
    organizationId: invitation.organizationId,
    email: invitation.email,
    roleId: invitation.roleId,
    roleName: `Role ${invitation.roleId}`,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    createdAt: new Date("2026-06-24T12:00:00.000Z"),
  };
}

export class InMemoryEmployeeInvitationRepository implements EmployeeInvitationRepository {
  readonly invitations = new Map<string, EmployeeInvitation>();
  createCalls = 0;
  saveCalls = 0;

  async findByIdInOrganization(organizationId: string, invitationId: string) {
    const invitation = this.invitations.get(invitationId);

    return invitation && invitation.organizationId === organizationId ? invitation : null;
  }

  async findActivePendingByEmail(organizationId: string, email: string) {
    return (
      [...this.invitations.values()].find(
        (invitation) =>
          invitation.organizationId === organizationId &&
          invitation.email === email &&
          invitation.status === InvitationStatus.Pending,
      ) ?? null
    );
  }

  async findByToken(token: string) {
    return [...this.invitations.values()].find((invitation) => invitation.token === token) ?? null;
  }

  async findDetailsByIdInOrganization(organizationId: string, invitationId: string) {
    const invitation = await this.findByIdInOrganization(organizationId, invitationId);

    return invitation ? toReadModel(invitation) : null;
  }

  async findDetailsByToken(token: string): Promise<EmployeeInvitationTokenReadModel | null> {
    const invitation = await this.findByToken(token);

    return invitation
      ? {
          organizationId: invitation.organizationId,
          organizationName: "Org",
          email: invitation.email,
          roleId: invitation.roleId,
          roleName: `Role ${invitation.roleId}`,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        }
      : null;
  }

  async findAllByOrganization(organizationId: string) {
    return [...this.invitations.values()]
      .filter((invitation) => invitation.organizationId === organizationId)
      .map((invitation) => toReadModel(invitation));
  }

  async findFullAccessByOrganization(organizationId: string) {
    return [...this.invitations.values()]
      .filter((invitation) => invitation.organizationId === organizationId)
      .map((invitation) => toReadModel(invitation));
  }

  async create(invitation: EmployeeInvitation) {
    this.createCalls += 1;
    this.invitations.set(invitation.id, invitation);

    return toReadModel(invitation);
  }

  async save(invitation: EmployeeInvitation) {
    this.saveCalls += 1;
    this.invitations.set(invitation.id, invitation);

    return toReadModel(invitation);
  }

  seed(invitation: EmployeeInvitation) {
    this.invitations.set(invitation.id, invitation);
  }
}

export class FakeRoleRepository implements RoleRepository {
  private readonly roles = new Map<string, Role>();
  readonly createdKeys: string[] = [];

  constructor(roles: Role[] = []) {
    for (const role of roles) {
      this.roles.set(role.id, role);
    }
  }

  async findAllByOrganization(): Promise<RoleReadModel[]> {
    throw new Error("Method not implemented.");
  }

  async findByIdInOrganization(organizationId: string, roleId: string): Promise<Role | null> {
    const role = this.roles.get(roleId);

    return role && role.organizationId === organizationId ? role : null;
  }

  async findByKeyInOrganization(organizationId: string, key: string): Promise<Role | null> {
    return (
      [...this.roles.values()].find(
        (role) => role.organizationId === organizationId && role.key === key,
      ) ?? null
    );
  }

  async create(role: Role): Promise<void> {
    this.roles.set(role.id, role);
    if (role.key) {
      this.createdKeys.push(role.key);
    }
  }

  async replacePermissions(): Promise<RoleReadModel> {
    throw new Error("Method not implemented.");
  }
}

export class FakeEmailService implements EmailService {
  readonly sent: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
  }
}

export class FailingEmailService implements EmailService {
  async send(): Promise<void> {
    throw new Error("smtp down");
  }
}

export class FakeHashService implements HashService {
  async hash(value: string): Promise<string> {
    return `hashed:${value}`;
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return hash === `hashed:${value}`;
  }
}

export class FakeOrganizationEmployeeRepository implements OrganizationEmployeeRepository {
  readonly byDocument = new Map<string, OrganizationEmployee>();
  readonly created: OrganizationEmployee[] = [];

  async findById(): Promise<OrganizationEmployee | null> {
    return null;
  }

  async findByDocument(
    _organizationId: string,
    document: Document,
  ): Promise<OrganizationEmployee | null> {
    return this.byDocument.get(document.value) ?? null;
  }

  async findRoleAssignment() {
    return null;
  }

  async create(employee: OrganizationEmployee): Promise<void> {
    this.created.push(employee);
    this.byDocument.set(employee.document.value, employee);
  }
}

export class FakeUserRepository implements UserRepository {
  readonly byEmail = new Map<string, User>();
  readonly created: User[] = [];

  async findById(): Promise<User | null> {
    return null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.byEmail.get(email.value) ?? null;
  }

  async findByEmailInOrganization(_organizationId: string, email: Email): Promise<User | null> {
    return this.byEmail.get(email.value) ?? null;
  }

  async create(user: User): Promise<void> {
    this.created.push(user);
    this.byEmail.set(user.email.value, user);
  }

  async save(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export function buildRole(input: {
  id?: string;
  organizationId?: string;
  fullAccess?: boolean;
}): Role {
  return Role.create(
    {
      organizationId: input.organizationId ?? "org-1",
      key: input.fullAccess ? "SUPER_ADMIN" : "OPERATOR",
      name: input.fullAccess ? "Super administrador" : "Operador",
      fullAccess: input.fullAccess ?? false,
    },
    input.id ?? "role-1",
  );
}
