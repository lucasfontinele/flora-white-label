import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { AddressRepository } from "../../../addresses/application/repositories/AddressRepository.js";
import { Address } from "../../../addresses/domain/entities/Address.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../../../subscription-plans/application/repositories/SubscriptionPlanRepository.js";
import { SubscriptionPlan } from "../../../subscription-plans/domain/entities/SubscriptionPlan.js";
import { Organization } from "../../domain/entities/Organization.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import type {
  OrganizationPublicReadModel,
  OrganizationReadModel,
  OrganizationRepository,
} from "../repositories/OrganizationRepository.js";
import type { CreateOrganizationInput } from "./CreateOrganizationUseCase.js";
import type { UpdateOrganizationInput } from "./UpdateOrganizationUseCase.js";

export const fixedDate = new Date("2026-06-18T12:00:00.000Z");

export class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  readonly plans: SubscriptionPlan[] = [];

  async findById(id: string): Promise<SubscriptionPlan | null> {
    return this.plans.find((plan) => plan.id === id) ?? null;
  }

  async findDetailsById(id: string): Promise<SubscriptionPlanReadModel | null> {
    const plan = await this.findById(id);

    return plan ? this.toReadModel(plan) : null;
  }

  async findAllDetails(): Promise<SubscriptionPlanReadModel[]> {
    return this.plans.map((plan) => this.toReadModel(plan));
  }

  async create(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel> {
    this.plans.push(plan);

    return this.toReadModel(plan);
  }

  async save(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel> {
    const index = this.plans.findIndex((current) => current.id === plan.id);

    if (index >= 0) {
      this.plans[index] = plan;
    } else {
      this.plans.push(plan);
    }

    return this.toReadModel(plan);
  }

  async delete(id: string): Promise<void> {
    const index = this.plans.findIndex((plan) => plan.id === id);

    if (index >= 0) {
      this.plans.splice(index, 1);
    }
  }

  async hasOrganizations(): Promise<boolean> {
    return false;
  }

  private toReadModel(plan: SubscriptionPlan): SubscriptionPlanReadModel {
    return {
      id: plan.id,
      title: plan.title,
      description: plan.description ?? null,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
      unlimitedOperators: plan.unlimitedOperators,
      createdAt: fixedDate,
      updatedAt: fixedDate,
    };
  }
}

export class InMemoryAddressRepository implements AddressRepository {
  readonly addresses: Address[] = [];
  readonly created: Address[] = [];
  readonly saved: Address[] = [];
  readonly deletedIds: string[] = [];

  async create(address: Address): Promise<void> {
    this.addresses.push(address);
    this.created.push(address);
  }

  async save(address: Address): Promise<void> {
    const index = this.addresses.findIndex((current) => current.id === address.id);

    if (index >= 0) {
      this.addresses[index] = address;
    } else {
      this.addresses.push(address);
    }

    this.saved.push(address);
  }

  async delete(id: string): Promise<void> {
    const index = this.addresses.findIndex((address) => address.id === id);

    if (index >= 0) {
      this.addresses.splice(index, 1);
    }

    this.deletedIds.push(id);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  readonly organizations: Organization[] = [];
  readonly created: Organization[] = [];
  readonly saved: Organization[] = [];
  readonly deletedIds: string[] = [];

  constructor(
    private readonly addressRepository: InMemoryAddressRepository,
    private readonly subscriptionPlanRepository: InMemorySubscriptionPlanRepository,
  ) {}

  async findByCnpj(cnpj: Cnpj): Promise<Organization | null> {
    return this.organizations.find((organization) => organization.cnpj.value === cnpj.value) ?? null;
  }

  async findByCnpjExcludingId(cnpj: Cnpj, id: string): Promise<Organization | null> {
    return (
      this.organizations.find(
        (organization) => organization.id !== id && organization.cnpj.value === cnpj.value,
      ) ?? null
    );
  }

  async findById(id: string): Promise<Organization | null> {
    return this.organizations.find((organization) => organization.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<OrganizationPublicReadModel | null> {
    const organization = this.organizations.find((current) => current.slug === slug);

    if (!organization) {
      return null;
    }

    return {
      id: organization.id,
      tradeName: organization.tradeName,
      slug: organization.slug,
      settings: null,
    };
  }

  async findDetailsById(id: string): Promise<OrganizationReadModel | null> {
    const organization = await this.findById(id);

    if (!organization) {
      return null;
    }

    return this.toReadModel(organization);
  }

  async findAllDetails(): Promise<OrganizationReadModel[]> {
    return this.organizations.map((organization) => this.toReadModel(organization));
  }

  async create(organization: Organization): Promise<void> {
    this.organizations.push(organization);
    this.created.push(organization);
  }

  async save(organization: Organization): Promise<void> {
    const index = this.organizations.findIndex((current) => current.id === organization.id);

    if (index >= 0) {
      this.organizations[index] = organization;
    } else {
      this.organizations.push(organization);
    }

    this.saved.push(organization);
  }

  async delete(id: string): Promise<void> {
    const index = this.organizations.findIndex((organization) => organization.id === id);

    if (index >= 0) {
      this.organizations.splice(index, 1);
    }

    this.deletedIds.push(id);
  }

  toReadModel(organization: Organization): OrganizationReadModel {
    const address = this.addressRepository.addresses.find(
      (current) => current.id === organization.addressId,
    );
    const plan = this.subscriptionPlanRepository.plans.find(
      (current) => current.id === organization.currentPlanId,
    );

    if (!address || !plan) {
      throw new Error("Test fixture is missing organization address or plan.");
    }

    return {
      id: organization.id,
      tradeName: organization.tradeName,
      legalName: organization.legalName,
      cnpj: organization.cnpj.value,
      primaryCnae: organization.primaryCnae.value,
      secondaryCnaes: organization.secondaryCnaes.map((cnae) => cnae.value),
      currentPlan: {
        id: plan.id,
        title: plan.title,
        priceInCents: plan.priceInCents,
        operatorsLimit: plan.operatorsLimit,
        patientsLimit: plan.patientsLimit,
      },
      address: {
        id: address.id,
        title: address.title,
        zipcode: address.zipcode,
        street: address.street,
        neighborhood: address.neighborhood,
        complement: address.complement,
        city: address.city,
        state: address.state,
      },
      createdAt: fixedDate,
      updatedAt: fixedDate,
    };
  }
}

export class TrackingUnitOfWork implements UnitOfWork {
  calls = 0;

  async execute<T>(work: () => Promise<T>): Promise<T> {
    this.calls += 1;

    return work();
  }
}

export function makePlan(id = "plan-1"): SubscriptionPlan {
  return SubscriptionPlan.create(
    {
      title: "Plano Essencial",
      description: "Ideal para associacoes iniciantes.",
      price: MoneyInCents.create(15000),
      operatorsLimit: 5,
      patientsLimit: 100,
    },
    id,
  );
}

export function makeAddress(id = "address-1"): Address {
  return Address.create(
    {
      title: "Sede",
      zipcode: "01001-000",
      street: "Praca da Se",
      neighborhood: "Se",
      complement: "Sala 01",
      city: "Sao Paulo",
      state: "SP",
    },
    id,
  );
}

export function makeOrganization(id = "organization-1", addressId = "address-1"): Organization {
  return Organization.create(
    {
      slug: "flora-assoc",
      tradeName: "Flora Assoc",
      legalName: "Flora Associacao LTDA",
      cnpj: Cnpj.create("11.222.333/0001-81"),
      primaryCnae: Cnae.create("8630-5/03"),
      secondaryCnaes: [Cnae.create("9499-5/00")],
      currentPlanId: "plan-1",
      addressId,
    },
    id,
  );
}

export function validCreateInput(): CreateOrganizationInput {
  return {
    organization: {
      tradeName: "Flora Assoc",
      legalName: "Flora Associacao LTDA",
      cnpj: "11.222.333/0001-81",
      primaryCnae: "8630-5/03",
      secondaryCnaes: ["9499-5/00"],
      currentPlanId: "plan-1",
    },
    address: {
      title: "Sede",
      zipcode: "01001-000",
      street: "Praca da Se",
      neighborhood: "Se",
      complement: "Sala 01",
      city: "Sao Paulo",
      state: "SP",
    },
  };
}

export function validUpdateInput(id = "organization-1"): UpdateOrganizationInput {
  return {
    id,
    organization: {
      tradeName: "Flora Assoc Atualizada",
      legalName: "Flora Associacao Atualizada LTDA",
      cnpj: "11.222.333/0001-81",
      primaryCnae: "8630-5/03",
      secondaryCnaes: ["9499-5/00"],
      currentPlanId: "plan-1",
    },
    address: {
      title: "Sede atualizada",
      zipcode: "77000-000",
      street: "Rua Atualizada",
      neighborhood: "Centro",
      complement: null,
      city: "Palmas",
      state: "TO",
    },
  };
}
