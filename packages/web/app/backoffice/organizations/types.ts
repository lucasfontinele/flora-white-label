// Shapes returned by and sent to the /backoffice/organizations endpoints.

export type OrganizationPlan = {
  id: string;
  title: string;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
};

export type OrganizationAddress = {
  id: string;
  title: string | null;
  zipcode: string;
  street: string;
  neighborhood: string;
  complement: string | null;
  city: string;
  state: string;
};

export type Organization = {
  id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  currentPlan: OrganizationPlan;
  address: OrganizationAddress;
  createdAt: string;
  updatedAt: string;
};

// GET /backoffice/organizations
export type ListOrganizationsResponse = {
  data: Organization[];
};

// Body for POST and PUT /backoffice/organizations[/:id]
export type OrganizationWriteBody = {
  organization: {
    tradeName: string;
    legalName: string;
    cnpj: string;
    primaryCnae: string;
    secondaryCnaes: string[];
    currentPlanId: string;
  };
  address: {
    title: string | null;
    zipcode: string;
    street: string;
    neighborhood: string;
    complement: string | null;
    city: string;
    state: string;
  };
};

// Shape returned by GET /backoffice/subscription-plans.
export type SubscriptionPlan = {
  id: string;
  title: string;
  description: string | null;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
  unlimitedOperators: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListSubscriptionPlansResponse = {
  data: SubscriptionPlan[];
};

// Master-admin invitations — /backoffice/organizations/:id/admin-invitations.

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  EXPIRED: "Expirado",
  REVOKED: "Cancelado",
};

export type AdminInvitation = {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type AdminInvitationsResponse = {
  data: AdminInvitation[];
};

export type SendAdminInvitationBody = {
  email: string;
};

// GET /addresses/zipcode/:zipcode
export type ZipcodeAddress = {
  zipcode: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
};
