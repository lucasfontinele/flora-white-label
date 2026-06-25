import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { RolePermissionEntry } from "../../domain/entities/Role.js";
import type { RoleReadModel, RoleRepository } from "../repositories/RoleRepository.js";

export interface SetRolePermissionsInput {
  organizationId: string;
  roleId: string;
  permissions: RolePermissionEntry[];
}

export interface SetRolePermissionsDependencies {
  roleRepository: RoleRepository;
  unitOfWork: UnitOfWork;
}

export class SetRolePermissionsUseCase {
  constructor(private readonly deps: SetRolePermissionsDependencies) {}

  async execute(input: SetRolePermissionsInput): Promise<RoleReadModel> {
    const role = await this.deps.roleRepository.findByIdInOrganization(
      input.organizationId,
      input.roleId,
    );
    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    // Throws a DomainValidationError when the role is full-access or a
    // permission entry is invalid.
    role.setPermissions(input.permissions);

    return this.deps.unitOfWork.execute(() => this.deps.roleRepository.replacePermissions(role));
  }
}
