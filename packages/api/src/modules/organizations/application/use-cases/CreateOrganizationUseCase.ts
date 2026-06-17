import { z } from "zod";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { Address } from "../../../addresses/domain/entities/Address.js";
import type { AddressRepository } from "../../../addresses/application/repositories/AddressRepository.js";
import type { SubscriptionPlanRepository } from "../../../subscription-plans/application/repositories/SubscriptionPlanRepository.js";
import { Organization } from "../../domain/entities/Organization.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";

const inputSchema = z.object({
  planId: z.string().min(1),
  organization: z.object({
    tradeName: z.string().min(1),
    legalName: z.string().min(1),
    cnpj: z.string().min(1),
    primaryCnae: z.string().min(1),
    secondaryCnaes: z.array(z.string().min(1)).optional(),
  }),
  address: z.object({
    title: z.string().optional(),
    zipcode: z.string().min(1),
    street: z.string().min(1),
    neighborhood: z.string().min(1),
    complement: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
  }),
});

export interface CreateOrganizationInput {
  planId: string;
  organization: {
    tradeName: string;
    legalName: string;
    cnpj: string;
    primaryCnae: string;
    secondaryCnaes?: string[];
  };
  address: {
    title?: string;
    zipcode: string;
    street: string;
    neighborhood: string;
    complement?: string;
    city: string;
    state: string;
  };
}

export interface CreateOrganizationOutput {
  organizationId: string;
  addressId: string;
  planId: string;
}

export interface CreateOrganizationDependencies {
  subscriptionPlanRepository: SubscriptionPlanRepository;
  organizationRepository: OrganizationRepository;
  addressRepository: AddressRepository;
  unitOfWork: UnitOfWork;
}

/**
 * Registers an organization (association) with its initial address. The Master
 * user provides the plan, address and registration data. OrganizationSettings
 * is intentionally NOT created here — it is configured later by the
 * organization's own user and is outside this aggregate.
 */
export class CreateOrganizationUseCase {
  constructor(private readonly deps: CreateOrganizationDependencies) {}

  async execute(input: CreateOrganizationInput): Promise<CreateOrganizationOutput> {
    const data = inputSchema.parse(input);

    const plan = await this.deps.subscriptionPlanRepository.findById(data.planId);
    if (!plan) {
      throw new NotFoundError(`Subscription plan "${data.planId}" was not found.`);
    }

    const cnpj = Cnpj.create(data.organization.cnpj);
    if (await this.deps.organizationRepository.findByCnpj(cnpj)) {
      throw new ConflictError(`An organization with CNPJ "${cnpj.value}" already exists.`);
    }

    const address = Address.create({
      title: data.address.title ?? null,
      zipcode: data.address.zipcode,
      street: data.address.street,
      neighborhood: data.address.neighborhood,
      complement: data.address.complement ?? null,
      city: data.address.city,
      state: data.address.state,
    });

    const organization = Organization.create({
      tradeName: data.organization.tradeName,
      legalName: data.organization.legalName,
      cnpj,
      primaryCnae: Cnae.create(data.organization.primaryCnae),
      secondaryCnaes: (data.organization.secondaryCnaes ?? []).map((cnae) => Cnae.create(cnae)),
      currentPlanId: plan.id,
      addressId: address.id,
    });

    await this.deps.unitOfWork.execute(async () => {
      await this.deps.addressRepository.create(address);
      await this.deps.organizationRepository.create(organization);
    });

    return {
      organizationId: organization.id,
      addressId: address.id,
      planId: plan.id,
    };
  }
}
