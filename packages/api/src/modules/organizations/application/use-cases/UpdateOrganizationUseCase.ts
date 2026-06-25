import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Address } from "../../../addresses/domain/entities/Address.js";
import type { AddressRepository } from "../../../addresses/application/repositories/AddressRepository.js";
import type { SubscriptionPlanRepository } from "../../../subscription-plans/application/repositories/SubscriptionPlanRepository.js";
import { Organization } from "../../domain/entities/Organization.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import type {
  OrganizationReadModel,
  OrganizationRepository,
} from "../repositories/OrganizationRepository.js";

export interface UpdateOrganizationInput {
  id: string;
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

export interface UpdateOrganizationDependencies {
  subscriptionPlanRepository: SubscriptionPlanRepository;
  organizationRepository: OrganizationRepository;
  addressRepository: AddressRepository;
  unitOfWork: UnitOfWork;
}

export class UpdateOrganizationUseCase {
  constructor(private readonly deps: UpdateOrganizationDependencies) {}

  async execute(input: UpdateOrganizationInput): Promise<OrganizationReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const existingOrganization = await this.deps.organizationRepository.findById(input.id);

      if (!existingOrganization) {
        throw new NotFoundError(`Organization "${input.id}" was not found.`);
      }

      const plan = await this.deps.subscriptionPlanRepository.findById(
        input.organization.currentPlanId,
      );
      if (!plan) {
        throw new NotFoundError(
          `Subscription plan "${input.organization.currentPlanId}" was not found.`,
        );
      }

      const cnpj = Cnpj.create(input.organization.cnpj);
      if (await this.deps.organizationRepository.findByCnpjExcludingId(cnpj, input.id)) {
        throw new ConflictError(`An organization with CNPJ "${cnpj.value}" already exists.`);
      }

      const address = Address.create(
        {
          title: input.address.title ?? null,
          zipcode: input.address.zipcode,
          street: input.address.street,
          neighborhood: input.address.neighborhood,
          complement: input.address.complement ?? null,
          city: input.address.city,
          state: input.address.state,
        },
        existingOrganization.addressId,
      );

      const organization = Organization.create(
        {
          slug: existingOrganization.slug,
          tradeName: input.organization.tradeName,
          legalName: input.organization.legalName,
          cnpj,
          primaryCnae: Cnae.create(input.organization.primaryCnae),
          secondaryCnaes: (input.organization.secondaryCnaes ?? []).map((cnae) =>
            Cnae.create(cnae),
          ),
          currentPlanId: plan.id,
          addressId: existingOrganization.addressId,
        },
        existingOrganization.id,
      );

      await this.deps.addressRepository.save(address);
      await this.deps.organizationRepository.save(organization);

      const details = await this.deps.organizationRepository.findDetailsById(organization.id);
      if (!details) {
        throw new NotFoundError(`Organization "${organization.id}" was not found.`);
      }

      return details;
    });
  }
}
