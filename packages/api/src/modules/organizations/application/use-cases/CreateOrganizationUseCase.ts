import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { Address } from "../../../addresses/domain/entities/Address.js";
import type { AddressRepository } from "../../../addresses/application/repositories/AddressRepository.js";
import type { SubscriptionPlanRepository } from "../../../subscription-plans/application/repositories/SubscriptionPlanRepository.js";
import { Organization } from "../../domain/entities/Organization.js";
import { slugify } from "../../domain/slug.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";
import type {
  OrganizationReadModel,
  OrganizationRepository,
} from "../repositories/OrganizationRepository.js";

export interface CreateOrganizationInput {
  organization: {
    tradeName: string;
    legalName: string;
    cnpj: string;
    primaryCnae: string;
    secondaryCnaes?: string[];
    currentPlanId: string;
  };
  address: {
    title?: string | null;
    zipcode: string;
    street: string;
    neighborhood: string;
    complement?: string | null;
    city: string;
    state: string;
  };
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

  async execute(input: CreateOrganizationInput): Promise<OrganizationReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const plan = await this.deps.subscriptionPlanRepository.findById(
        input.organization.currentPlanId,
      );
      if (!plan) {
        throw new NotFoundError(
          `Subscription plan "${input.organization.currentPlanId}" was not found.`,
        );
      }

      const cnpj = Cnpj.create(input.organization.cnpj);
      if (await this.deps.organizationRepository.findByCnpj(cnpj)) {
        throw new ConflictError(`An organization with CNPJ "${cnpj.value}" already exists.`);
      }

      const address = Address.create({
        title: input.address.title ?? null,
        zipcode: input.address.zipcode,
        street: input.address.street,
        neighborhood: input.address.neighborhood,
        complement: input.address.complement ?? null,
        city: input.address.city,
        state: input.address.state,
      });

      const slug = await this.generateUniqueSlug(input.organization.tradeName);

      const organization = Organization.create({
        slug,
        tradeName: input.organization.tradeName,
        legalName: input.organization.legalName,
        cnpj,
        primaryCnae: Cnae.create(input.organization.primaryCnae),
        secondaryCnaes: (input.organization.secondaryCnaes ?? []).map((cnae) =>
          Cnae.create(cnae),
        ),
        currentPlanId: plan.id,
        addressId: address.id,
      });

      await this.deps.addressRepository.create(address);
      await this.deps.organizationRepository.create(organization);

      const details = await this.deps.organizationRepository.findDetailsById(organization.id);
      if (!details) {
        throw new NotFoundError(`Organization "${organization.id}" was not found.`);
      }

      return details;
    });
  }

  // Derives a URL-safe slug from the trade name, appending a numeric suffix
  // until it is unique (used for subdomain-based tenant resolution).
  private async generateUniqueSlug(tradeName: string): Promise<string> {
    const base = slugify(tradeName) || "organizacao";
    let candidate = base;
    let suffix = 2;

    while (await this.deps.organizationRepository.findBySlug(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }
}
