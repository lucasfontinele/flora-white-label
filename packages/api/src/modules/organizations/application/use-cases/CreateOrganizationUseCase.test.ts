import { describe, expect, it } from "vitest";
import {
  CreateOrganizationUseCase,
  type CreateOrganizationInput,
} from "./CreateOrganizationUseCase.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { SubscriptionPlan } from "../../../subscription-plans/domain/entities/SubscriptionPlan.js";
import type { SubscriptionPlanRepository } from "../../../subscription-plans/application/repositories/SubscriptionPlanRepository.js";
import type { AddressRepository } from "../../../addresses/application/repositories/AddressRepository.js";
import type { Address } from "../../../addresses/domain/entities/Address.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";
import type { Organization } from "../../domain/entities/Organization.js";
import type { Cnpj } from "../../domain/value-objects/Cnpj.js";

class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  readonly plans: SubscriptionPlan[] = [];

  async findById(id: string): Promise<SubscriptionPlan | null> {
    return this.plans.find((plan) => plan.id === id) ?? null;
  }
}

class InMemoryOrganizationRepository implements OrganizationRepository {
  readonly organizations: Organization[] = [];

  async findByCnpj(cnpj: Cnpj): Promise<Organization | null> {
    return this.organizations.find((org) => org.cnpj.value === cnpj.value) ?? null;
  }

  async create(organization: Organization): Promise<void> {
    this.organizations.push(organization);
  }
}

class InMemoryAddressRepository implements AddressRepository {
  readonly addresses: Address[] = [];

  async create(address: Address): Promise<void> {
    this.addresses.push(address);
  }
}

const immediateUnitOfWork: UnitOfWork = {
  execute: (work) => work(),
};

function makeSut(options: { withPlan?: boolean } = {}) {
  const subscriptionPlanRepository = new InMemorySubscriptionPlanRepository();
  const organizationRepository = new InMemoryOrganizationRepository();
  const addressRepository = new InMemoryAddressRepository();

  if (options.withPlan ?? true) {
    subscriptionPlanRepository.plans.push(
      SubscriptionPlan.create(
        {
          title: "Plano Essencial",
          description: "Ideal para associações iniciantes.",
          price: MoneyInCents.create(15000),
          operatorsLimit: 5,
          patientsLimit: 100,
        },
        "plan-1",
      ),
    );
  }

  const useCase = new CreateOrganizationUseCase({
    subscriptionPlanRepository,
    organizationRepository,
    addressRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { useCase, subscriptionPlanRepository, organizationRepository, addressRepository };
}

function validInput(): CreateOrganizationInput {
  return {
    planId: "plan-1",
    organization: {
      tradeName: "Flora Assoc",
      legalName: "Flora Associação LTDA",
      cnpj: "11.222.333/0001-81",
      primaryCnae: "8630-5/03",
      secondaryCnaes: ["8888888"],
    },
    address: {
      zipcode: "01001-000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    },
  };
}

describe("CreateOrganizationUseCase", () => {
  it("fails when the subscription plan does not exist", async () => {
    const sut = makeSut({ withPlan: false });

    await expect(sut.useCase.execute(validInput())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("fails when the CNPJ is already registered", async () => {
    const sut = makeSut();
    await sut.useCase.execute(validInput());

    await expect(sut.useCase.execute(validInput())).rejects.toBeInstanceOf(ConflictError);
  });

  it("creates the address and the organization with valid data", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(validInput());

    expect(sut.addressRepository.addresses).toHaveLength(1);
    expect(sut.organizationRepository.organizations).toHaveLength(1);

    const [address] = sut.addressRepository.addresses;
    const [organization] = sut.organizationRepository.organizations;

    expect(output.addressId).toBe(address?.id);
    expect(output.organizationId).toBe(organization?.id);
    expect(output.planId).toBe("plan-1");
    expect(organization?.addressId).toBe(address?.id);
    expect(organization?.cnpj.value).toBe("11222333000181");
    expect(address?.zipcode).toBe("01001000");
  });
});
