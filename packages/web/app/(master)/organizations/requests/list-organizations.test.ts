import { afterEach, describe, expect, it, vi } from "vitest";
import { listOrganizations } from "./list-organizations";

const response = {
  data: [
    {
      city: "Palmas",
      cnpj: "11222333000181",
      createdAt: "2026-06-16T00:00:00.000Z",
      id: "org_1",
      legalName: "Associacao Medicinal Exemplo LTDA",
      state: "TO",
      subscriptionPlan: {
        code: "starter",
        id: "plan_starter",
        maxActiveUsers: 50,
        maxOperators: 10,
        name: "Starter",
        operatorLimitType: "limited",
        priceInCents: 59700,
      },
      tradeName: "Associacao Exemplo",
    },
  ],
  pagination: {
    page: 1,
    perPage: 20,
    total: 1,
    totalPages: 1,
  },
};

describe("listOrganizations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the organization list with pagination and temporary Master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listOrganizations({ page: 1, perPage: 20 })).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/organizations?page=1&perPage=20",
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
