import { describe, expect, it } from "vitest";
import { ListOrganizationsUseCase } from "./ListOrganizationsUseCase.js";
import {
  InMemoryAddressRepository,
  InMemoryOrganizationRepository,
  InMemorySubscriptionPlanRepository,
  makeAddress,
  makeOrganization,
  makePlan,
} from "./organization-use-case-test-utils.js";

function makeSut() {
  const subscriptionPlanRepository = new InMemorySubscriptionPlanRepository();
  const addressRepository = new InMemoryAddressRepository();
  const organizationRepository = new InMemoryOrganizationRepository(
    addressRepository,
    subscriptionPlanRepository,
  );
  const useCase = new ListOrganizationsUseCase(organizationRepository);

  return { useCase, subscriptionPlanRepository, organizationRepository, addressRepository };
}

describe("ListOrganizationsUseCase", () => {
  it("returns an empty list when there are no organizations", async () => {
    const { useCase } = makeSut();

    await expect(useCase.execute()).resolves.toEqual({ data: [] });
  });

  it("returns organizations with address and current plan summaries", async () => {
    const sut = makeSut();
    sut.subscriptionPlanRepository.plans.push(makePlan());
    sut.addressRepository.addresses.push(makeAddress());
    sut.organizationRepository.organizations.push(makeOrganization());

    const output = await sut.useCase.execute();

    expect(output.data).toHaveLength(1);
    expect(output.data[0]).toMatchObject({
      id: "organization-1",
      tradeName: "Flora Assoc",
      cnpj: "11222333000181",
      primaryCnae: "8630503",
      secondaryCnaes: ["9499500"],
      currentPlan: {
        id: "plan-1",
        title: "Plano Essencial",
      },
      address: {
        id: "address-1",
        zipcode: "01001000",
        state: "SP",
      },
    });
  });
});
