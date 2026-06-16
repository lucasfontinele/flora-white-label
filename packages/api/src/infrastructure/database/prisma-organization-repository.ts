import type { PrismaClient } from "@prisma/client";
import { ConflictException } from "../../exception/index.js";
import type { CreateOrganizationRecordInput, Organization } from "../../domain/organizations/organization.js";
import type { SubscriptionPlan } from "../../domain/subscription-plans/subscription-plan.js";
import type { ListOrganizationsInput, ListOrganizationsResult } from "../../application/organizations/organization-repository.js";
import { prisma as defaultPrisma } from "./prisma-client.js";

export class PrismaOrganizationRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async existsByCnpj(cnpj: string): Promise<boolean> {
    const organization = await this.client.organization.findUnique({
      select: { id: true },
      where: { cnpj },
    });

    return Boolean(organization);
  }

  async create(input: CreateOrganizationRecordInput): Promise<Organization> {
    try {
      const organization = await this.client.$transaction(async (tx) => {
        const address = await tx.address.create({
          data: input.address,
        });

        return tx.organization.create({
          data: {
            ...input.company,
            addressId: address.id,
            createdByMasterUserId: input.createdByMasterUserId,
            subscriptionPlanId: input.subscriptionPlanId,
          },
          include: {
            address: true,
            subscriptionPlan: true,
          },
        });
      });

      return mapOrganization(organization);
    } catch (error) {
      if (isUniqueConstraintError(error, "cnpj")) {
        throw new ConflictException("Já existe uma organização cadastrada com este CNPJ.");
      }

      throw error;
    }
  }

  async list(input: ListOrganizationsInput): Promise<ListOrganizationsResult> {
    const [organizations, total] = await Promise.all([
      this.client.organization.findMany({
        include: {
          address: true,
          subscriptionPlan: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.perPage,
        take: input.perPage,
      }),
      this.client.organization.count(),
    ]);

    return {
      data: organizations.map(mapOrganization),
      pagination: {
        page: input.page,
        perPage: input.perPage,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / input.perPage),
      },
    };
  }
}

function mapOrganization(organization: {
  address: {
    cep: string;
    city: string;
    complement: string | null;
    id: string;
    logradouro: string;
    neighborhood: string;
    number: string;
    state: string;
  };
  addressId: string;
  cnpj: string;
  facebook?: string | null;
  createdAt: Date;
  createdByMasterUserId: string;
  foundationDate: Date;
  id: string;
  instagram?: string | null;
  institutionalEmail: string;
  linkedin?: string | null;
  legalName: string;
  phone?: string | null;
  primaryCnae: string;
  secondaryCnaes: string[];
  site?: string | null;
  subscriptionPlan: {
    code: string;
    id: string;
    maxActiveUsers: number;
    maxOperators: number | null;
    name: string;
    operatorLimitType: string;
    priceInCents: number;
  };
  subscriptionPlanId: string;
  tradeName: string;
  updatedAt: Date;
  whatsapp: string;
}): Organization {
  return {
    address: {
      cep: organization.address.cep,
      city: organization.address.city,
      complement: organization.address.complement ?? undefined,
      id: organization.address.id,
      logradouro: organization.address.logradouro,
      neighborhood: organization.address.neighborhood,
      number: organization.address.number,
      state: organization.address.state,
    },
    addressId: organization.addressId,
    cnpj: organization.cnpj,
    createdAt: organization.createdAt,
    createdByMasterUserId: organization.createdByMasterUserId,
    facebook: organization.facebook ?? undefined,
    foundationDate: organization.foundationDate,
    id: organization.id,
    instagram: organization.instagram ?? undefined,
    institutionalEmail: organization.institutionalEmail,
    linkedin: organization.linkedin ?? undefined,
    legalName: organization.legalName,
    phone: organization.phone ?? undefined,
    primaryCnae: organization.primaryCnae,
    secondaryCnaes: organization.secondaryCnaes,
    site: organization.site ?? undefined,
    subscriptionPlan: mapPlan(organization.subscriptionPlan),
    subscriptionPlanId: organization.subscriptionPlanId,
    tradeName: organization.tradeName,
    updatedAt: organization.updatedAt,
    whatsapp: organization.whatsapp,
  };
}

function mapPlan(plan: {
  code: string;
  id: string;
  maxActiveUsers: number;
  maxOperators: number | null;
  name: string;
  operatorLimitType: string;
  priceInCents: number;
}): SubscriptionPlan {
  return {
    code: plan.code as SubscriptionPlan["code"],
    id: plan.id,
    maxActiveUsers: plan.maxActiveUsers,
    maxOperators: plan.maxOperators,
    name: plan.name as SubscriptionPlan["name"],
    operatorLimitType: plan.operatorLimitType as SubscriptionPlan["operatorLimitType"],
    priceInCents: plan.priceInCents,
  };
}

function isUniqueConstraintError(error: unknown, field: string) {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: string; meta?: { target?: unknown } };
  return candidate.code === "P2002" && Array.isArray(candidate.meta?.target)
    ? candidate.meta.target.includes(field)
    : false;
}
