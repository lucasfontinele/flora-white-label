import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Role } from "../../domain/entities/Role.js";
import type { RoleReadModel, RoleRepository } from "../repositories/RoleRepository.js";

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

export function toRoleReadModel(role: Role, membersCount = 0): RoleReadModel {
  return {
    id: role.id,
    organizationId: role.organizationId,
    key: role.key,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    fullAccess: role.fullAccess,
    viewAll: role.viewAll,
    permissions: role.permissions,
    membersCount,
  };
}

export class InMemoryRoleRepository implements RoleRepository {
  readonly roles = new Map<string, Role>();
  replaceCalls = 0;

  async findAllByOrganization(organizationId: string): Promise<RoleReadModel[]> {
    return [...this.roles.values()]
      .filter((role) => role.organizationId === organizationId)
      .map((role) => toRoleReadModel(role));
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
  }

  async replacePermissions(role: Role): Promise<RoleReadModel> {
    this.replaceCalls += 1;
    this.roles.set(role.id, role);

    return toRoleReadModel(role);
  }

  seed(role: Role): void {
    this.roles.set(role.id, role);
  }
}
