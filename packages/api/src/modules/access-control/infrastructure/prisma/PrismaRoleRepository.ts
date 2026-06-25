import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { RoleReadModel, RoleRepository } from "../../application/repositories/RoleRepository.js";
import type { Role } from "../../domain/entities/Role.js";
import { RoleMapper } from "./RoleMapper.js";

const readModelArgs = {
  include: {
    permissions: true,
    _count: { select: { employees: true } },
  },
} as const;

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findAllByOrganization(organizationId: string): Promise<RoleReadModel[]> {
    const records = await this.prisma.getClient().role.findMany({
      where: { organizationId },
      ...readModelArgs,
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => RoleMapper.toReadModel(record));
  }

  async findByIdInOrganization(organizationId: string, roleId: string): Promise<Role | null> {
    const record = await this.prisma.getClient().role.findFirst({
      where: { id: roleId, organizationId },
      include: { permissions: true },
    });

    return record ? RoleMapper.toDomain(record) : null;
  }

  async findByKeyInOrganization(organizationId: string, key: string): Promise<Role | null> {
    const record = await this.prisma.getClient().role.findFirst({
      where: { organizationId, key },
      include: { permissions: true },
    });

    return record ? RoleMapper.toDomain(record) : null;
  }

  async create(role: Role): Promise<void> {
    const client = this.prisma.getClient();

    await client.role.create({
      data: {
        id: role.id,
        organizationId: role.organizationId,
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        fullAccess: role.fullAccess,
        viewAll: role.viewAll,
      },
    });

    const permissions = role.permissions;
    if (permissions.length > 0) {
      await client.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          module: permission.module,
          action: permission.action,
        })),
      });
    }
  }

  async replacePermissions(role: Role): Promise<RoleReadModel> {
    const client = this.prisma.getClient();

    await client.rolePermission.deleteMany({ where: { roleId: role.id } });

    const permissions = role.permissions;
    if (permissions.length > 0) {
      await client.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          module: permission.module,
          action: permission.action,
        })),
      });
    }

    const record = await client.role.findFirstOrThrow({
      where: { id: role.id },
      ...readModelArgs,
    });

    return RoleMapper.toReadModel(record);
  }
}
