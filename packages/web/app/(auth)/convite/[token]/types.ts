// Shapes for the public employee-invitation endpoints (token-based).

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

// GET /employee-invitations/:token
export type InvitationToken = {
  organizationId: string;
  organizationName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: string;
  isAcceptable: boolean;
};

export type AcceptInvitationBody = {
  fullName: string;
  document: string;
  password: string;
};

// POST /employee-invitations/:token/accept
export type AcceptInvitationResponse = {
  userId: string;
  organizationEmployeeId: string;
  email: string;
};
