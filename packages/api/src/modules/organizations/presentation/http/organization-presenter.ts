import type { OrganizationReadModel } from "../../application/repositories/OrganizationRepository.js";

export interface OrganizationResponse {
  id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  currentPlan: {
    id: string;
    title: string;
    priceInCents: number;
    operatorsLimit: number;
    patientsLimit: number;
  };
  address: {
    id: string;
    title: string | null;
    zipcode: string;
    street: string;
    neighborhood: string;
    complement: string | null;
    city: string;
    state: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class OrganizationPresenter {
  static toHttp(organization: OrganizationReadModel): OrganizationResponse {
    return {
      id: organization.id,
      tradeName: organization.tradeName,
      legalName: organization.legalName,
      cnpj: organization.cnpj,
      primaryCnae: organization.primaryCnae,
      secondaryCnaes: organization.secondaryCnaes,
      currentPlan: organization.currentPlan,
      address: organization.address,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
    };
  }
}
