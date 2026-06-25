import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { OrganizationEmployeeRepository } from "../../../organization-employees/application/repositories/OrganizationEmployeeRepository.js";
import type { RolePermissionEntry } from "../../domain/entities/Role.js";
import type { RoleRepository } from "../repositories/RoleRepository.js";

export interface GetEmployeePermissionsInput {
  organizationId: string;
  employeeId: string;
}

export interface EmployeePermissions {
  employeeId: string;
  roleId: string | null;
  roleName: string | null;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermissionEntry[];
}

export interface GetEmployeePermissionsDependencies {
  organizationEmployeeRepository: OrganizationEmployeeRepository;
  roleRepository: RoleRepository;
}

/**
 * Returns the effective access of an organization employee, derived from the
 * role assigned to them. The frontend uses this to gate the UI. An employee
 * with no role (or a missing role) gets no permissions.
 */
export class GetEmployeePermissionsUseCase {
  constructor(private readonly deps: GetEmployeePermissionsDependencies) {}

  async execute(input: GetEmployeePermissionsInput): Promise<EmployeePermissions> {
    const employee = await this.deps.organizationEmployeeRepository.findRoleAssignment(
      input.employeeId,
    );
    if (!employee || employee.organizationId !== input.organizationId) {
      throw new NotFoundError("Employee not found.");
    }

    const empty: EmployeePermissions = {
      employeeId: employee.id,
      roleId: employee.roleId,
      roleName: null,
      fullAccess: false,
      viewAll: false,
      permissions: [],
    };

    if (!employee.roleId) {
      return empty;
    }

    const role = await this.deps.roleRepository.findByIdInOrganization(
      input.organizationId,
      employee.roleId,
    );
    if (!role) {
      return empty;
    }

    return {
      employeeId: employee.id,
      roleId: role.id,
      roleName: role.name,
      fullAccess: role.fullAccess,
      viewAll: role.viewAll,
      permissions: role.permissions,
    };
  }
}
