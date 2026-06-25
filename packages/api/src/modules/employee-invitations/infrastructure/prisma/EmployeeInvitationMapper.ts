import type { EmployeeInvitation as PrismaEmployeeInvitation, Prisma } from "@prisma/client";
import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationTokenReadModel,
} from "../../application/repositories/EmployeeInvitationRepository.js";
import { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import { InvitationStatus } from "../../domain/enums/InvitationStatus.js";

export type PrismaInvitationWithRole = PrismaEmployeeInvitation & { role: { name: string } };

export type PrismaInvitationWithRoleAndOrg = PrismaInvitationWithRole & {
  organization: { tradeName: string };
};

export class EmployeeInvitationMapper {
  static toDomain(record: PrismaEmployeeInvitation): EmployeeInvitation {
    return EmployeeInvitation.restore(
      {
        organizationId: record.organizationId,
        email: record.email,
        roleId: record.roleId,
        token: record.token,
        status: record.status as InvitationStatus,
        expiresAt: record.expiresAt,
        acceptedAt: record.acceptedAt,
        invitedByUserId: record.invitedByUserId,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaInvitationWithRole): EmployeeInvitationReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      email: record.email,
      roleId: record.roleId,
      roleName: record.role.name,
      status: record.status as InvitationStatus,
      expiresAt: record.expiresAt,
      acceptedAt: record.acceptedAt,
      createdAt: record.createdAt,
    };
  }

  static toTokenReadModel(
    record: PrismaInvitationWithRoleAndOrg,
  ): EmployeeInvitationTokenReadModel {
    return {
      organizationId: record.organizationId,
      organizationName: record.organization.tradeName,
      email: record.email,
      roleId: record.roleId,
      roleName: record.role.name,
      status: record.status as InvitationStatus,
      expiresAt: record.expiresAt,
    };
  }

  static toPersistence(
    invitation: EmployeeInvitation,
  ): Prisma.EmployeeInvitationUncheckedCreateInput {
    return {
      id: invitation.id,
      organizationId: invitation.organizationId,
      email: invitation.email,
      roleId: invitation.roleId,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      invitedByUserId: invitation.invitedByUserId,
    };
  }

  static toUpdatePersistence(
    invitation: EmployeeInvitation,
  ): Prisma.EmployeeInvitationUncheckedUpdateInput {
    return {
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
    };
  }
}
