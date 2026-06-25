import { afterEach, describe, expect, it, vi } from "vitest";
import { updateOrganization } from "./update-organization";
import type { OrganizationWriteBody } from "../types";

const body: OrganizationWriteBody = {
  organization: {
    tradeName: "Associacao Exemplo",
    legalName: "Associacao Medicinal Exemplo LTDA",
    cnpj: "11222333000181",
    primaryCnae: "9430800",
    secondaryCnaes: [],
    currentPlanId: "plan_growth",
  },
  address: {
    title: "Sede",
    zipcode: "77001000",
    street: "Quadra 101 Sul, 10",
    neighborhood: "Plano Diretor Sul",
    complement: null,
    city: "Palmas",
    state: "TO",
  },
};

describe("updateOrganization", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a PUT request with the write body to the backoffice endpoint", async () => {
    const response = { id: "org_1", ...body.organization, address: { id: "addr_1", ...body.address } };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateOrganization("org_1", body);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/organizations/org_1",
      expect.objectContaining({
        body: JSON.stringify(body),
        headers: expect.any(Headers),
        method: "PUT",
      }),
    );
  });
});
