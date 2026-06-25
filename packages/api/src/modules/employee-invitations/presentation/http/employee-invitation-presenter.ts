import type {
  EmployeeInvitationReadModel,
  EmployeeInvitationTokenReadModel,
} from "../../application/repositories/EmployeeInvitationRepository.js";
import type { AcceptEmployeeInvitationOutput } from "../../application/use-cases/AcceptEmployeeInvitationUseCase.js";
import { InvitationStatus } from "../../domain/enums/InvitationStatus.js";

export interface InvitationResponse {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface InvitationTokenResponse {
  organizationId: string;
  organizationName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: string;
  isAcceptable: boolean;
}

export interface AcceptInvitationResponse {
  userId: string;
  organizationEmployeeId: string;
  email: string;
}

export class EmployeeInvitationPresenter {
  static toHttp(invitation: EmployeeInvitationReadModel): InvitationResponse {
    return {
      id: invitation.id,
      organizationId: invitation.organizationId,
      email: invitation.email,
      roleId: invitation.roleId,
      roleName: invitation.roleName,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
      createdAt: invitation.createdAt.toISOString(),
    };
  }

  static tokenToHttp(invitation: EmployeeInvitationTokenReadModel): InvitationTokenResponse {
    const isAcceptable =
      invitation.status === InvitationStatus.Pending &&
      invitation.expiresAt.getTime() > Date.now();

    return {
      organizationId: invitation.organizationId,
      organizationName: invitation.organizationName,
      email: invitation.email,
      roleId: invitation.roleId,
      roleName: invitation.roleName,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      isAcceptable,
    };
  }

  static acceptToHttp(output: AcceptEmployeeInvitationOutput): AcceptInvitationResponse {
    return {
      userId: output.userId,
      organizationEmployeeId: output.organizationEmployeeId,
      email: output.email,
    };
  }
}
