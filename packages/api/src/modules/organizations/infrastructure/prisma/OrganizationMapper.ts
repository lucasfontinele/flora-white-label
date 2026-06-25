import type {
  Address as PrismaAddress,
  Organization as PrismaOrganization,
  Prisma,
  SubscriptionPlan as PrismaSubscriptionPlan,
} from "@prisma/client";
import type { OrganizationReadModel } from "../../application/repositories/OrganizationRepository.js";
import { Organization } from "../../domain/entities/Organization.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";

export type PrismaOrganizationWithDetails = PrismaOrganization & {
  address: PrismaAddress;
  currentPlan: PrismaSubscriptionPlan;
};

export class OrganizationMapper {
  static toDomain(record: PrismaOrganization): Organization {
    return Organization.create(
      {
        slug: record.slug,
        tradeName: record.tradeName,
        legalName: record.legalName,
        cnpj: Cnpj.create(record.cnpj),
        primaryCnae: Cnae.create(record.primaryCnae),
        secondaryCnaes: record.secondaryCnaes.map((cnae) => Cnae.create(cnae)),
        currentPlanId: record.currentPlanId,
        addressId: record.addressId,
      },
      record.id,
    );
  }

  static toPersistence(organization: Organization): Prisma.OrganizationUncheckedCreateInput {
    return {
      id: organization.id,
      slug: organization.slug,
      tradeName: organization.tradeName,
      legalName: organization.legalName,
      cnpj: organization.cnpj.value,
      primaryCnae: organization.primaryCnae.value,
      secondaryCnaes: organization.secondaryCnaes.map((cnae) => cnae.value),
      currentPlanId: organization.currentPlanId,
      addressId: organization.addressId,
    };
  }

  static toUpdatePersistence(
    organization: Organization,
  ): Prisma.OrganizationUncheckedUpdateInput {
    return {
      slug: organization.slug,
      tradeName: organization.tradeName,
      legalName: organization.legalName,
      cnpj: organization.cnpj.value,
      primaryCnae: organization.primaryCnae.value,
      secondaryCnaes: organization.secondaryCnaes.map((cnae) => cnae.value),
      currentPlanId: organization.currentPlanId,
      addressId: organization.addressId,
    };
  }

  static toReadModel(record: PrismaOrganizationWithDetails): OrganizationReadModel {
    return {
      id: record.id,
      tradeName: record.tradeName,
      legalName: record.legalName,
      cnpj: record.cnpj,
      primaryCnae: record.primaryCnae,
      secondaryCnaes: record.secondaryCnaes,
      currentPlan: {
        id: record.currentPlan.id,
        title: record.currentPlan.title,
        priceInCents: record.currentPlan.priceInCents,
        operatorsLimit: record.currentPlan.operatorsLimit,
        patientsLimit: record.currentPlan.patientsLimit,
      },
      address: {
        id: record.address.id,
        title: record.address.title,
        zipcode: record.address.zipcode,
        street: record.address.street,
        neighborhood: record.address.neighborhood,
        complement: record.address.complement,
        city: record.address.city,
        state: record.address.state,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
