import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { OrganizationEmployee } from "../../domain/entities/OrganizationEmployee.js";
import type { OrganizationEmployeeRepository } from "../repositories/OrganizationEmployeeRepository.js";

export interface CreateOrganizationEmployeeInput {
  organizationId: string;
  userId: string;
  fullName: string;
  document: string;
}

export interface CreateOrganizationEmployeeDependencies {
  organizationEmployeeRepository: OrganizationEmployeeRepository;
  organizationRepository: OrganizationRepository;
  userRepository: UserRepository;
  unitOfWork: UnitOfWork;
}

/**
 * Registers an employee for an organization. The employee links to an existing
 * User (the account that will access the control panel) and carries the
 * organization-scoped personal data. Guards uniqueness of the CPF per
 * organization and ensures one employee per user.
 */
export class CreateOrganizationEmployeeUseCase {
  constructor(private readonly deps: CreateOrganizationEmployeeDependencies) {}

  async execute(input: CreateOrganizationEmployeeInput): Promise<OrganizationEmployee> {
    // Fail fast on an invalid CPF before touching the database.
    const document = Document.create(input.document);

    return this.deps.unitOfWork.execute(async () => {
      const organization = await this.deps.organizationRepository.findById(input.organizationId);
      if (!organization) {
        throw new NotFoundError(`Organization "${input.organizationId}" was not found.`);
      }

      const user = await this.deps.userRepository.findById(input.userId);
      if (!user) {
        throw new NotFoundError(`User "${input.userId}" was not found.`);
      }

      if (user.organizationId !== organization.id) {
        throw new ConflictError("User does not belong to the organization.");
      }

      if (user.organizationEmployeeId) {
        throw new ConflictError(`User "${user.id}" is already an employee.`);
      }

      if (await this.deps.organizationEmployeeRepository.findByDocument(organization.id, document)) {
        throw new ConflictError(
          `An employee with document "${document.value}" already exists in this organization.`,
        );
      }

      const employee = OrganizationEmployee.create({
        organizationId: organization.id,
        fullName: input.fullName,
        document,
        isActive: true,
      });

      await this.deps.organizationEmployeeRepository.create(employee);

      // The User owns the relation, so link and persist it.
      user.linkOrganizationEmployee(employee.id);
      await this.deps.userRepository.save(user);

      return employee;
    });
  }
}
