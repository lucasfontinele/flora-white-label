import type { RoleReadModel } from "../../application/repositories/RoleRepository.js";
import type { EmployeePermissions } from "../../application/use-cases/GetEmployeePermissionsUseCase.js";
import type { PermissionAction } from "../../domain/enums/PermissionAction.js";
import type { PermissionModule } from "../../domain/enums/PermissionModule.js";

export interface RolePermissionResponse {
  module: PermissionModule;
  action: PermissionAction;
}

export interface RoleResponse {
  id: string;
  organizationId: string;
  key: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermissionResponse[];
  membersCount: number;
}

export interface EmployeePermissionsResponse {
  employeeId: string;
  roleId: string | null;
  roleName: string | null;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermissionResponse[];
}

export class AccessControlPresenter {
  static employeePermissionsToHttp(input: EmployeePermissions): EmployeePermissionsResponse {
    return {
      employeeId: input.employeeId,
      roleId: input.roleId,
      roleName: input.roleName,
      fullAccess: input.fullAccess,
      viewAll: input.viewAll,
      permissions: input.permissions.map((permission) => ({
        module: permission.module,
        action: permission.action,
      })),
    };
  }

  static roleToHttp(role: RoleReadModel): RoleResponse {
    return {
      id: role.id,
      organizationId: role.organizationId,
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      fullAccess: role.fullAccess,
      viewAll: role.viewAll,
      permissions: role.permissions.map((permission) => ({
        module: permission.module,
        action: permission.action,
      })),
      membersCount: role.membersCount,
    };
  }
}
