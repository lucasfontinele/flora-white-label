import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Organization } from "../../domain/entities/Organization.js";
import { Cnae } from "../../domain/value-objects/Cnae.js";
import { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { UpdateOrganizationUseCase } from "./UpdateOrganizationUseCase.js";
import {
  InMemoryAddressRepository,
  InMemoryOrganizationRepository,
  InMemorySubscriptionPlanRepository,
  TrackingUnitOfWork,
  makeAddress,
  makeOrganization,
  makePlan,
  validUpdateInput,
} from "./organization-use-case-test-utils.js";

function makeSut(options: { withPlan?: boolean; withOrganization?: boolean } = {}) {
  const subscriptionPlanRepository = new InMemorySubscriptionPlanRepository();
  const addressRepository = new InMemoryAddressRepository();
  const organizationRepository = new InMemoryOrganizationRepository(
    addressRepository,
    subscriptionPlanRepository,
  );
  const unitOfWork = new TrackingUnitOfWork();

  if (options.withPlan ?? true) {
    subscriptionPlanRepository.plans.push(makePlan());
  }

  if (options.withOrganization ?? true) {
    addressRepository.addresses.push(makeAddress());
    organizationRepository.organizations.push(makeOrganization());
  }

  const useCase = new UpdateOrganizationUseCase({
    subscriptionPlanRepository,
    organizationRepository,
    addressRepository,
    unitOfWork,
  });

  return {
    useCase,
    subscriptionPlanRepository,
    organizationRepository,
    addressRepository,
    unitOfWork,
  };
}

describe("UpdateOrganizationUseCase", () => {
  it("fully updates organization and associated address atomically", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(validUpdateInput());

    expect(sut.unitOfWork.calls).toBe(1);
    expect(sut.addressRepository.saved).toHaveLength(1);
    expect(sut.organizationRepository.saved).toHaveLength(1);
    expect(output.id).toBe("organization-1");
    expect(output.tradeName).toBe("Flora Assoc Atualizada");
    expect(output.cnpj).toBe("11222333000181");
    expect(output.address).toMatchObject({
      id: "address-1",
      title: "Sede atualizada",
      zipcode: "77000000",
      complement: null,
      city: "Palmas",
      state: "TO",
    });
  });

  it("throws not found when the organization does not exist without saving", async () => {
    const sut = makeSut({ withOrganization: false });

    await expect(sut.useCase.execute(validUpdateInput())).rejects.toBeInstanceOf(NotFoundError);

    expect(sut.addressRepository.saved).toHaveLength(0);
    expect(sut.organizationRepository.saved).toHaveLength(0);
  });

  it("throws not found when the new subscription plan does not exist without saving", async () => {
    const sut = makeSut({ withPlan: false });

    await expect(sut.useCase.execute(validUpdateInput())).rejects.toBeInstanceOf(NotFoundError);

    expect(sut.addressRepository.saved).toHaveLength(0);
    expect(sut.organizationRepository.saved).toHaveLength(0);
  });

  it("throws conflict when another organization already uses the CNPJ", async () => {
    const sut = makeSut();
    sut.addressRepository.addresses.push(makeAddress("address-2"));
    sut.organizationRepository.organizations.push(
      Organization.create(
        {
          tradeName: "Outra Assoc",
          legalName: "Outra Associacao LTDA",
          cnpj: Cnpj.create("12.544.992/0001-05"),
          primaryCnae: Cnae.create("8630-5/03"),
          secondaryCnaes: [],
          currentPlanId: "plan-1",
          addressId: "address-2",
        },
        "organization-2",
      ),
    );
    const input = validUpdateInput();
    input.organization.cnpj = "12.544.992/0001-05";

    await expect(sut.useCase.execute(input)).rejects.toBeInstanceOf(ConflictError);

    expect(sut.addressRepository.saved).toHaveLength(0);
    expect(sut.organizationRepository.saved).toHaveLength(0);
  });

  it("fails on invalid address data without mutating prior data", async () => {
    const sut = makeSut();
    const input = validUpdateInput();
    input.address.state = "XX";

    await expect(sut.useCase.execute(input)).rejects.toBeInstanceOf(DomainValidationError);

    expect(sut.addressRepository.saved).toHaveLength(0);
    expect(sut.organizationRepository.saved).toHaveLength(0);
    expect(sut.addressRepository.addresses[0]?.state).toBe("SP");
    expect(sut.organizationRepository.organizations[0]?.tradeName).toBe("Flora Assoc");
  });
});
