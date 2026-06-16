import type {
  OrganizationCompanyDataDto,
  OrganizationDto,
  OrganizationListItemDto,
} from "@flora/shared/organizations";
import type { Address } from "../addresses/address.js";
import type { SubscriptionPlan } from "../subscription-plans/subscription-plan.js";

export type OrganizationCompanyData = Omit<OrganizationCompanyDataDto, "foundationDate"> & {
  foundationDate: Date;
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

export function organizationToResponse(organization: Organization): OrganizationDto {
  return {
    address: organization.address,
    company: {
      cnpj: organization.cnpj,
      facebook: organization.facebook,
      foundationDate: organization.foundationDate.toISOString().slice(0, 10),
      instagram: organization.instagram,
      institutionalEmail: organization.institutionalEmail,
      linkedin: organization.linkedin,
      legalName: organization.legalName,
      phone: organization.phone,
      primaryCnae: organization.primaryCnae,
      secondaryCnaes: organization.secondaryCnaes,
      site: organization.site,
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

export function organizationToListItem(organization: Organization): OrganizationListItemDto {
  return {
    city: organization.address.city,
    cnpj: organization.cnpj,
    createdAt: organization.createdAt.toISOString(),
    id: organization.id,
    legalName: organization.legalName,
    state: organization.address.state,
    subscriptionPlan: organization.subscriptionPlan,
    tradeName: organization.tradeName,
  };
}
