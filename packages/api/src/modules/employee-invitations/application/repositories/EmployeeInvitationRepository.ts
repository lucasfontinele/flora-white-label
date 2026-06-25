import type { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import type { InvitationStatus } from "../../domain/enums/InvitationStatus.js";

export interface EmployeeInvitationReadModel {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

/** Detail shown to the invitee on the public registration screen (no token). */
export interface EmployeeInvitationTokenReadModel {
  organizationId: string;
  organizationName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: Date;
}

export interface EmployeeInvitationRepository {
  findByIdInOrganization(
    organizationId: string,
    invitationId: string,
  ): Promise<EmployeeInvitation | null>;
  findActivePendingByEmail(
    organizationId: string,
    email: string,
  ): Promise<EmployeeInvitation | null>;
  findByToken(token: string): Promise<EmployeeInvitation | null>;
  findDetailsByIdInOrganization(
    organizationId: string,
    invitationId: string,
  ): Promise<EmployeeInvitationReadModel | null>;
  findDetailsByToken(token: string): Promise<EmployeeInvitationTokenReadModel | null>;
  findAllByOrganization(organizationId: string): Promise<EmployeeInvitationReadModel[]>;
  create(invitation: EmployeeInvitation): Promise<EmployeeInvitationReadModel>;
  save(invitation: EmployeeInvitation): Promise<EmployeeInvitationReadModel>;
}
