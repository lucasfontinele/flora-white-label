export type PlanCode = "starter" | "growth" | "unlimited";

export type OperatorLimitType = "limited" | "unlimited";

export type SubscriptionPlanDto = {
  code: PlanCode;
  id: string;
  maxActiveUsers: number;
  maxOperators: number | null;
  name: "Starter" | "Growth" | "Unlimited";
  operatorLimitType: OperatorLimitType;
  priceInCents: number;
};

export type AddressDto = {
  cep: string;
  city: string;
  complement?: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export type PersistedAddressDto = AddressDto & {
  id: string;
};

export type OrganizationCompanyDataDto = {
  cnpj: string;
  facebook?: string;
  foundationDate: string;
  instagram?: string;
  institutionalEmail: string;
  linkedin?: string;
  legalName: string;
  phone?: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  site?: string;
  tradeName: string;
  whatsapp: string;
};

export type CreateOrganizationRequest = {
  address: AddressDto;
  company: OrganizationCompanyDataDto;
  subscriptionPlanId: string;
};

export type OrganizationDto = {
  address: PersistedAddressDto;
  company: OrganizationCompanyDataDto;
  createdAt: string;
  createdByMasterUserId: string;
  id: string;
  subscriptionPlan: SubscriptionPlanDto;
  updatedAt: string;
};

export type OrganizationListItemDto = {
  city: string;
  cnpj: string;
  createdAt: string;
  id: string;
  legalName: string;
  state: string;
  subscriptionPlan: SubscriptionPlanDto;
  tradeName: string;
};

export type PaginationDto = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ListOrganizationsQuery = {
  page?: number;
  perPage?: number;
};

export type ListOrganizationsResponse = {
  data: OrganizationListItemDto[];
  pagination: PaginationDto;
};

export type CreateOrganizationResponse = {
  data: OrganizationDto;
};

export type ListSubscriptionPlansResponse = {
  data: SubscriptionPlanDto[];
};

export type ErrorResponseDto = {
  error: {
    code: string;
    details?: unknown;
    message: string;
  };
};
