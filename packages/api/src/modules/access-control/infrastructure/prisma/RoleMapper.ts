import type { Role as PrismaRole, RolePermission as PrismaRolePermission } from "@prisma/client";
import type { RoleReadModel } from "../../application/repositories/RoleRepository.js";
import { Role, type RolePermissionEntry } from "../../domain/entities/Role.js";
import { PermissionAction } from "../../domain/enums/PermissionAction.js";
import { PermissionModule } from "../../domain/enums/PermissionModule.js";

export type PrismaRoleWithPermissions = PrismaRole & { permissions: PrismaRolePermission[] };

export type PrismaRoleWithPermissionsAndCount = PrismaRoleWithPermissions & {
  _count: { employees: number };
};

function toPermissionEntries(permissions: PrismaRolePermission[]): RolePermissionEntry[] {
  return permissions.map((permission) => ({
    module: permission.module as PermissionModule,
    action: permission.action as PermissionAction,
  }));
}

export class RoleMapper {
  static toDomain(record: PrismaRoleWithPermissions): Role {
    return Role.restore(
      {
        organizationId: record.organizationId,
        key: record.key,
        name: record.name,
        description: record.description,
        isSystem: record.isSystem,
        fullAccess: record.fullAccess,
        viewAll: record.viewAll,
        permissions: toPermissionEntries(record.permissions),
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaRoleWithPermissionsAndCount): RoleReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      key: record.key,
      name: record.name,
      description: record.description,
      isSystem: record.isSystem,
      fullAccess: record.fullAccess,
      viewAll: record.viewAll,
      permissions: toPermissionEntries(record.permissions),
      membersCount: record._count.employees,
    };
  }
}
