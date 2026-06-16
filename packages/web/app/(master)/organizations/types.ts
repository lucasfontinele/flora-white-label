export type SubscriptionPlan = {
  code: "starter" | "growth" | "unlimited";
  id: string;
  maxActiveUsers: number;
  maxOperators: number | null;
  name: "Starter" | "Growth" | "Unlimited";
  operatorLimitType: "limited" | "unlimited";
  priceInCents: number;
};

export type OrganizationCompanyData = {
  cnpj: string;
  foundationDate: string;
  institutionalEmail: string;
  legalName: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  tradeName: string;
  whatsapp: string;
};

export type Address = {
  cep: string;
  city: string;
  complement?: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export type CreateOrganizationInput = {
  address: Address;
  company: OrganizationCompanyData;
  subscriptionPlanId: string;
};

export type CreatedOrganization = {
  address: Address & { id: string };
  company: OrganizationCompanyData;
  createdAt: string;
  createdByMasterUserId: string;
  id: string;
  subscriptionPlan: SubscriptionPlan;
  updatedAt: string;
};
