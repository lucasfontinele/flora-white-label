import { afterEach, describe, expect, it, vi } from "vitest";
import { listOrganizations } from "./list-organizations";

const response = {
  data: [
    {
      id: "org_1",
      tradeName: "Associacao Exemplo",
      legalName: "Associacao Medicinal Exemplo LTDA",
      cnpj: "11222333000181",
      primaryCnae: "9430800",
      secondaryCnaes: ["9499500"],
      currentPlan: {
        id: "plan_starter",
        title: "Starter",
        priceInCents: 59700,
        operatorsLimit: 10,
        patientsLimit: 50,
      },
      address: {
        id: "addr_1",
        title: null,
        zipcode: "77001000",
        street: "Quadra 101 Sul",
        neighborhood: "Plano Diretor Sul",
        complement: null,
        city: "Palmas",
        state: "TO",
      },
      createdAt: "2026-06-16T00:00:00.000Z",
      updatedAt: "2026-06-16T00:00:00.000Z",
    },
  ],
};

describe("listOrganizations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the organization list with temporary Master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listOrganizations()).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/organizations",
      expect.objectContaining({
        headers: expect.any(Headers),
        method: "GET",
      }),
    );
    const headers = fetchMock.mock.calls[0]?.[1].headers as Headers;
    expect(headers.get("x-master-user-id")).toBe("master_local");
    expect(headers.get("x-master-role")).toBe("master");
  });

  it("throws the structured API message when the list request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Usuário não autorizado." } }), {
          status: 403,
        }),
      ),
    );

    await expect(listOrganizations()).rejects.toThrow("Usuário não autorizado.");
  });
});
