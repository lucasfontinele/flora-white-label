import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { CreateOrganizationUseCase } from "./CreateOrganizationUseCase.js";
import {
  InMemoryAddressRepository,
  InMemoryOrganizationRepository,
  InMemorySubscriptionPlanRepository,
  TrackingUnitOfWork,
  makePlan,
  validCreateInput,
} from "./organization-use-case-test-utils.js";

function makeSut(options: { withPlan?: boolean } = {}) {
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

  const useCase = new CreateOrganizationUseCase({
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

describe("CreateOrganizationUseCase", () => {
  it("creates the address and organization atomically with normalized response data", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(validCreateInput());

    expect(sut.unitOfWork.calls).toBe(1);
    expect(sut.addressRepository.created).toHaveLength(1);
    expect(sut.organizationRepository.created).toHaveLength(1);
    expect(output.id).toEqual(expect.any(String));
    expect(output.tradeName).toBe("Flora Assoc");
    expect(output.cnpj).toBe("11222333000181");
    expect(output.primaryCnae).toBe("8630503");
    expect(output.secondaryCnaes).toEqual(["9499500"]);
    expect(output.currentPlan).toMatchObject({
      id: "plan-1",
      title: "Plano Essencial",
      priceInCents: 15000,
      operatorsLimit: 5,
      patientsLimit: 100,
    });
    expect(output.address.zipcode).toBe("01001000");
    expect(output.address.state).toBe("SP");
    expect(sut.organizationRepository.created[0]?.addressId).toBe(
      sut.addressRepository.created[0]?.id,
    );
  });

  it("fails when the subscription plan does not exist without partial writes", async () => {
    const sut = makeSut({ withPlan: false });

    await expect(sut.useCase.execute(validCreateInput())).rejects.toBeInstanceOf(NotFoundError);

    expect(sut.addressRepository.created).toHaveLength(0);
    expect(sut.organizationRepository.created).toHaveLength(0);
  });

  it("fails when the CNPJ is already registered without creating another address", async () => {
    const sut = makeSut();
    await sut.useCase.execute(validCreateInput());

    await expect(sut.useCase.execute(validCreateInput())).rejects.toBeInstanceOf(ConflictError);

    expect(sut.addressRepository.created).toHaveLength(1);
    expect(sut.organizationRepository.created).toHaveLength(1);
  });

  it("fails on invalid address data without partial writes", async () => {
    const sut = makeSut();
    const input = validCreateInput();
    input.address.zipcode = "01001";

    await expect(sut.useCase.execute(input)).rejects.toBeInstanceOf(DomainValidationError);

    expect(sut.addressRepository.created).toHaveLength(0);
    expect(sut.organizationRepository.created).toHaveLength(0);
  });
});
