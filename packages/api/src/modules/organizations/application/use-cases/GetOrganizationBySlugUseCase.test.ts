import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { GetOrganizationBySlugUseCase } from "./GetOrganizationBySlugUseCase.js";
import {
  InMemoryAddressRepository,
  InMemoryOrganizationRepository,
  InMemorySubscriptionPlanRepository,
  makeOrganization,
} from "./organization-use-case-test-utils.js";

function makeSut() {
  const addressRepository = new InMemoryAddressRepository();
  const subscriptionPlanRepository = new InMemorySubscriptionPlanRepository();
  const organizationRepository = new InMemoryOrganizationRepository(
    addressRepository,
    subscriptionPlanRepository,
  );
  organizationRepository.organizations.push(makeOrganization());

  return { sut: new GetOrganizationBySlugUseCase(organizationRepository), organizationRepository };
}

describe("GetOrganizationBySlugUseCase", () => {
  it("resolves the public tenant view from the slug", async () => {
    const { sut } = makeSut();

    const result = await sut.execute({ slug: "flora-assoc" });

    expect(result).toEqual({ id: "organization-1", tradeName: "Flora Assoc", slug: "flora-assoc", settings: null });
  });

  it("normalizes the incoming slug before lookup", async () => {
    const { sut } = makeSut();

    await expect(sut.execute({ slug: "Flora Assoc" })).resolves.toMatchObject({ slug: "flora-assoc" });
  });

  it("throws NotFoundError for an unknown slug", async () => {
    const { sut } = makeSut();

    await expect(sut.execute({ slug: "inexistente" })).rejects.toBeInstanceOf(NotFoundError);
  });
});
