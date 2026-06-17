import type { Prisma, Organization as PrismaOrganization } from "@prisma/client";
import { Organization } from "../../domain/entities/Organization.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";

export class OrganizationMapper {
  static toDomain(record: PrismaOrganization): Organization {
    return Organization.create(
      {
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
      tradeName: organization.tradeName,
      legalName: organization.legalName,
      cnpj: organization.cnpj.value,
      primaryCnae: organization.primaryCnae.value,
      secondaryCnaes: organization.secondaryCnaes.map((cnae) => cnae.value),
      currentPlanId: organization.currentPlanId,
      addressId: organization.addressId,
    };
  }
}
