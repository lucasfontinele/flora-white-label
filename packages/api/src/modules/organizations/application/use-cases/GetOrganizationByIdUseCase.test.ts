import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { GetOrganizationByIdUseCase } from "./GetOrganizationByIdUseCase.js";
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
  const useCase = new GetOrganizationByIdUseCase(organizationRepository);

  return { useCase, subscriptionPlanRepository, organizationRepository, addressRepository };
}

describe("GetOrganizationByIdUseCase", () => {
  it("returns an organization with address and current plan summaries", async () => {
    const sut = makeSut();
    sut.subscriptionPlanRepository.plans.push(makePlan());
    sut.addressRepository.addresses.push(makeAddress());
    sut.organizationRepository.organizations.push(makeOrganization());

    const output = await sut.useCase.execute({ id: "organization-1" });

    expect(output).toMatchObject({
      id: "organization-1",
      tradeName: "Flora Assoc",
      currentPlan: {
        id: "plan-1",
        priceInCents: 15000,
      },
      address: {
        id: "address-1",
        zipcode: "01001000",
      },
    });
  });

  it("throws not found when the organization does not exist", async () => {
    const { useCase } = makeSut();

    await expect(useCase.execute({ id: "missing" })).rejects.toBeInstanceOf(NotFoundError);
  });
});
