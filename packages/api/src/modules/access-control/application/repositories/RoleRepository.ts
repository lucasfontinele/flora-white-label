import type { Role, RolePermissionEntry } from "../../domain/entities/Role.js";

export interface RoleReadModel {
  id: string;
  organizationId: string;
  key: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermissionEntry[];
  membersCount: number;
}

export interface RoleRepository {
  findAllByOrganization(organizationId: string): Promise<RoleReadModel[]>;
  findByIdInOrganization(organizationId: string, roleId: string): Promise<Role | null>;
  /** Replaces the role's permission grid atomically (delete-then-insert). */
  replacePermissions(role: Role): Promise<RoleReadModel>;
}
