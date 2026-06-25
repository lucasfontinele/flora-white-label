import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationRepository,
  EmployeeInvitationTokenReadModel,
} from "../../application/repositories/EmployeeInvitationRepository.js";
import type { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import { InvitationStatus } from "../../domain/enums/InvitationStatus.js";
import { EmployeeInvitationMapper } from "./EmployeeInvitationMapper.js";

const withRole = { include: { role: { select: { name: true } } } } as const;
const withRoleAndOrg = {
  include: {
    role: { select: { name: true } },
    organization: { select: { tradeName: true } },
  },
} as const;

export class PrismaEmployeeInvitationRepository implements EmployeeInvitationRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdInOrganization(
    organizationId: string,
    invitationId: string,
  ): Promise<EmployeeInvitation | null> {
    const record = await this.prisma.getClient().employeeInvitation.findFirst({
      where: { id: invitationId, organizationId },
    });

    return record ? EmployeeInvitationMapper.toDomain(record) : null;
  }

  async findActivePendingByEmail(
    organizationId: string,
    email: string,
  ): Promise<EmployeeInvitation | null> {
    const record = await this.prisma.getClient().employeeInvitation.findFirst({
      where: { organizationId, email, status: InvitationStatus.Pending },
      orderBy: { createdAt: "desc" },
    });

    return record ? EmployeeInvitationMapper.toDomain(record) : null;
  }

  async findByToken(token: string): Promise<EmployeeInvitation | null> {
    const record = await this.prisma.getClient().employeeInvitation.findUnique({
      where: { token },
    });

    return record ? EmployeeInvitationMapper.toDomain(record) : null;
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    invitationId: string,
  ): Promise<EmployeeInvitationReadModel | null> {
    const record = await this.prisma.getClient().employeeInvitation.findFirst({
      where: { id: invitationId, organizationId },
      ...withRole,
    });

    return record ? EmployeeInvitationMapper.toReadModel(record) : null;
  }

  async findDetailsByToken(token: string): Promise<EmployeeInvitationTokenReadModel | null> {
    const record = await this.prisma.getClient().employeeInvitation.findUnique({
      where: { token },
      ...withRoleAndOrg,
    });

    return record ? EmployeeInvitationMapper.toTokenReadModel(record) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<EmployeeInvitationReadModel[]> {
    const records = await this.prisma.getClient().employeeInvitation.findMany({
      where: { organizationId },
      ...withRole,
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => EmployeeInvitationMapper.toReadModel(record));
  }

  async create(invitation: EmployeeInvitation): Promise<EmployeeInvitationReadModel> {
    const record = await this.prisma.getClient().employeeInvitation.create({
      data: EmployeeInvitationMapper.toPersistence(invitation),
      ...withRole,
    });

    return EmployeeInvitationMapper.toReadModel(record);
  }

  async save(invitation: EmployeeInvitation): Promise<EmployeeInvitationReadModel> {
    const record = await this.prisma.getClient().employeeInvitation.update({
      where: { id: invitation.id },
      data: EmployeeInvitationMapper.toUpdatePersistence(invitation),
      ...withRole,
    });

    return EmployeeInvitationMapper.toReadModel(record);
  }
}
