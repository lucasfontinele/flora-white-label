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

// GET /addresses/zipcode/:zipcode
export type ZipcodeAddress = {
  zipcode: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
};
