import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { PermissionAction } from "../enums/PermissionAction.js";
import { PermissionModule } from "../enums/PermissionModule.js";

export interface RolePermissionEntry {
  module: PermissionModule;
  action: PermissionAction;
}

export interface RoleProps {
  organizationId: string;
  key: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  /** Grants every action on every module (current and future). Super admin. */
  fullAccess: boolean;
  /** Grants VIEW on every module (current and future). Director-style role. */
  viewAll: boolean;
  permissions: RolePermissionEntry[];
}

export interface CreateRoleInput {
  organizationId: string;
  key?: string | null;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  fullAccess?: boolean;
  viewAll?: boolean;
  permissions?: RolePermissionEntry[];
}

export interface RestoreRoleInput {
  organizationId: string;
  key: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermissionEntry[];
}

function permissionKey(entry: RolePermissionEntry): string {
  return `${entry.module}:${entry.action}`;
}

/**
 * Aggregate Root for an organization access role. It owns the permission grid
 * (module x action) plus two coarse flags: `fullAccess` (everything, used by the
 * super-admin) and `viewAll` (VIEW on every module, used by a director role).
 * Framework-agnostic: no Prisma/Fastify/Zod/HTTP dependency.
 */
export class Role extends AggregateRoot<RoleProps> {
  private constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateRoleInput, id?: string): Role {
    const organizationId = input.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Role requires an organizationId.");
    }

    const name = input.name.trim();
    if (name.length === 0) {
      throw new DomainValidationError("Role name is required.");
    }

    const key = input.key?.trim() ? input.key.trim() : null;
    const description = input.description?.trim() ? input.description.trim() : null;

    return new Role(
      {
        organizationId,
        key,
        name,
        description,
        isSystem: input.isSystem ?? false,
        fullAccess: input.fullAccess ?? false,
        viewAll: input.viewAll ?? false,
        permissions: Role.normalizePermissions(input.permissions ?? []),
      },
      id,
    );
  }

  static restore(input: RestoreRoleInput, id: string): Role {
    return new Role(
      {
        organizationId: input.organizationId,
        key: input.key,
        name: input.name,
        description: input.description,
        isSystem: input.isSystem,
        fullAccess: input.fullAccess,
        viewAll: input.viewAll,
        permissions: Role.normalizePermissions(input.permissions),
      },
      id,
    );
  }

  /** Replaces the role's permission grid. Full-access roles cannot be edited. */
  setPermissions(permissions: RolePermissionEntry[]): void {
    if (this.props.fullAccess) {
      throw new DomainValidationError("Cannot edit the permissions of a full-access role.");
    }

    this.props.permissions = Role.normalizePermissions(permissions);
  }

  hasPermission(module: PermissionModule, action: PermissionAction): boolean {
    if (this.props.fullAccess) {
      return true;
    }

    if (this.props.viewAll && action === PermissionAction.View) {
      return true;
    }

    return this.props.permissions.some(
      (entry) => entry.module === module && entry.action === action,
    );
  }

  private static normalizePermissions(
    permissions: RolePermissionEntry[],
  ): RolePermissionEntry[] {
    const seen = new Map<string, RolePermissionEntry>();

    for (const entry of permissions) {
      if (!Object.values(PermissionModule).includes(entry.module)) {
        throw new DomainValidationError(`Invalid permission module: ${entry.module}.`);
      }

      if (!Object.values(PermissionAction).includes(entry.action)) {
        throw new DomainValidationError(`Invalid permission action: ${entry.action}.`);
      }

      seen.set(permissionKey(entry), { module: entry.module, action: entry.action });
    }

    return [...seen.values()];
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get key(): string | null {
    return this.props.key;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get isSystem(): boolean {
    return this.props.isSystem;
  }

  get fullAccess(): boolean {
    return this.props.fullAccess;
  }

  get viewAll(): boolean {
    return this.props.viewAll;
  }

  get permissions(): RolePermissionEntry[] {
    return [...this.props.permissions];
  }
}
