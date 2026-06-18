import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DeleteOrganizationUseCase } from "./DeleteOrganizationUseCase.js";
import {
  InMemoryAddressRepository,
  InMemoryOrganizationRepository,
  InMemorySubscriptionPlanRepository,
  TrackingUnitOfWork,
  makeAddress,
  makeOrganization,
  makePlan,
} from "./organization-use-case-test-utils.js";

function makeSut(options: { withOrganization?: boolean } = {}) {
  const subscriptionPlanRepository = new InMemorySubscriptionPlanRepository();
  const addressRepository = new InMemoryAddressRepository();
  const organizationRepository = new InMemoryOrganizationRepository(
    addressRepository,
    subscriptionPlanRepository,
  );
  const unitOfWork = new TrackingUnitOfWork();

  subscriptionPlanRepository.plans.push(makePlan());

  if (options.withOrganization ?? true) {
    addressRepository.addresses.push(makeAddress());
    organizationRepository.organizations.push(makeOrganization());
  }

  const useCase = new DeleteOrganizationUseCase({
    organizationRepository,
    addressRepository,
    unitOfWork,
  });

  return { useCase, organizationRepository, addressRepository, unitOfWork };
}

describe("DeleteOrganizationUseCase", () => {
  it("deletes an existing organization and cleans up its address in one unit of work", async () => {
    const sut = makeSut();

    await sut.useCase.execute({ id: "organization-1" });

    expect(sut.unitOfWork.calls).toBe(1);
    expect(sut.organizationRepository.deletedIds).toEqual(["organization-1"]);
    expect(sut.addressRepository.deletedIds).toEqual(["address-1"]);
    expect(sut.organizationRepository.organizations).toHaveLength(0);
    expect(sut.addressRepository.addresses).toHaveLength(0);
  });

  it("throws not found when the organization does not exist without deleting address", async () => {
    const sut = makeSut({ withOrganization: false });

    await expect(sut.useCase.execute({ id: "missing" })).rejects.toBeInstanceOf(NotFoundError);

    expect(sut.organizationRepository.deletedIds).toHaveLength(0);
    expect(sut.addressRepository.deletedIds).toHaveLength(0);
  });
});
