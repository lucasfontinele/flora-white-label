import { afterEach, describe, expect, it, vi } from "vitest";
import { createOrganization } from "./create-organization";
import type { OrganizationWriteBody } from "../types";

const body: OrganizationWriteBody = {
  organization: {
    tradeName: "Associacao Exemplo",
    legalName: "Associacao Medicinal Exemplo LTDA",
    cnpj: "11222333000181",
    primaryCnae: "9430800",
    secondaryCnaes: ["9499500"],
    currentPlanId: "plan_starter",
  },
  address: {
    title: null,
    zipcode: "77001000",
    street: "Quadra 101 Sul, 10",
    neighborhood: "Plano Diretor Sul",
    complement: null,
    city: "Palmas",
    state: "TO",
  },
};

const response = {
  id: "org_1",
  tradeName: body.organization.tradeName,
  legalName: body.organization.legalName,
  cnpj: body.organization.cnpj,
  primaryCnae: body.organization.primaryCnae,
  secondaryCnaes: body.organization.secondaryCnaes,
  currentPlan: {
    id: "plan_starter",
    title: "Starter",
    priceInCents: 59700,
    operatorsLimit: 10,
    patientsLimit: 50,
  },
  address: { id: "addr_1", ...body.address },
  createdAt: "2026-06-16T00:00:00.000Z",
  updatedAt: "2026-06-16T00:00:00.000Z",
};

describe("createOrganization", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts an organization registration payload to the backoffice endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createOrganization(body)).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/organizations",
      expect.objectContaining({
        body: JSON.stringify(body),
        headers: expect.any(Headers),
        method: "POST",
      }),
    );
  });
});
