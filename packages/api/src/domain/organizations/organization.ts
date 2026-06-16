import type { Address } from "../addresses/address.js";
import type { SubscriptionPlan } from "../subscription-plans/subscription-plan.js";

export type OrganizationCompanyData = {
  cnpj: string;
  foundationDate: Date;
  institutionalEmail: string;
  legalName: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  tradeName: string;
  whatsapp: string;
};

export type Organization = OrganizationCompanyData & {
  address: Address & { id: string };
  addressId: string;
  createdAt: Date;
  createdByMasterUserId: string;
  id: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionPlanId: string;
  updatedAt: Date;
};

export type CreateOrganizationRecordInput = {
  address: Address;
  company: OrganizationCompanyData;
  createdByMasterUserId: string;
  subscriptionPlanId: string;
};

export function organizationToResponse(organization: Organization) {
  return {
    address: organization.address,
    company: {
      cnpj: organization.cnpj,
      foundationDate: organization.foundationDate.toISOString().slice(0, 10),
      institutionalEmail: organization.institutionalEmail,
      legalName: organization.legalName,
      primaryCnae: organization.primaryCnae,
      secondaryCnaes: organization.secondaryCnaes,
      tradeName: organization.tradeName,
      whatsapp: organization.whatsapp,
    },
    createdAt: organization.createdAt.toISOString(),
    createdByMasterUserId: organization.createdByMasterUserId,
    id: organization.id,
    subscriptionPlan: organization.subscriptionPlan,
    updatedAt: organization.updatedAt.toISOString(),
  };
}
