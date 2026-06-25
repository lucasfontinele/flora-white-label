import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { OrganizationEmployeeRepository } from "../../../organization-employees/application/repositories/OrganizationEmployeeRepository.js";
import { OrganizationEmployee } from "../../../organization-employees/domain/entities/OrganizationEmployee.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { User } from "../../../users/domain/entities/User.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import { PasswordHash } from "../../../users/domain/value-objects/PasswordHash.js";
import type { EmployeeInvitationRepository } from "../repositories/EmployeeInvitationRepository.js";

export interface AcceptEmployeeInvitationInput {
  token: string;
  fullName: string;
  document: string;
  password: string;
}

export interface AcceptEmployeeInvitationOutput {
  userId: string;
  organizationEmployeeId: string;
  email: string;
}

export interface AcceptEmployeeInvitationDependencies {
  invitationRepository: EmployeeInvitationRepository;
  organizationEmployeeRepository: OrganizationEmployeeRepository;
  userRepository: UserRepository;
  hashService: HashService;
  unitOfWork: UnitOfWork;
}

export class AcceptEmployeeInvitationUseCase {
  constructor(private readonly deps: AcceptEmployeeInvitationDependencies) {}

  async execute(
    input: AcceptEmployeeInvitationInput,
  ): Promise<AcceptEmployeeInvitationOutput> {
    const invitation = await this.deps.invitationRepository.findByToken(input.token);
    if (!invitation) {
      throw new NotFoundError("Invitation not found.");
    }

    const email = Email.create(invitation.email);
    const document = Document.create(input.document);

    const existingUser = await this.deps.userRepository.findByEmailInOrganization(
      invitation.organizationId,
      email,
    );
    if (existingUser) {
      throw new ConflictError("A user with this e-mail already exists.");
    }

    const existingEmployee = await this.deps.organizationEmployeeRepository.findByDocument(
      invitation.organizationId,
      document,
    );
    if (existingEmployee) {
      throw new ConflictError("An employee with this document already exists.");
    }

    const passwordHash = PasswordHash.fromHash(await this.deps.hashService.hash(input.password));

    const employee = OrganizationEmployee.create({
      organizationId: invitation.organizationId,
      fullName: input.fullName,
      document,
      isActive: true,
      roleId: invitation.roleId,
    });

    const user = User.create({
      organizationId: invitation.organizationId,
      email,
      passwordHash,
      profile: UserProfile.Organization,
      organizationEmployeeId: employee.id,
    });

    // Marks accepted; throws a DomainValidationError if not pending or expired.
    invitation.accept();

    await this.deps.unitOfWork.execute(async () => {
      await this.deps.organizationEmployeeRepository.create(employee);
      await this.deps.userRepository.create(user);
      await this.deps.invitationRepository.save(invitation);
    });

    return {
      userId: user.id,
      organizationEmployeeId: employee.id,
      email: email.value,
    };
  }
}
