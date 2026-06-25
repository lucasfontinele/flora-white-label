import { afterEach, describe, expect, it, vi } from "vitest";
import { getOperationalDashboard } from "./get-operational-dashboard";

const ORGANIZATION_ID = "org-1";
const EMPLOYEE_ID = "emp-1";

const response = {
  data: {
    lowStock: [{ amount: "4 un.", name: "Óleo CBD 17% - 30ml", tone: "error" }],
    metrics: [{ delta: "+4", hint: "aguardando ação", icon: "inbox", label: "Pedidos pendentes", value: "12" }],
    ordersByStatus: [{ count: 12, status: "Solicitado" }],
    referenceLabel: "Junho 2026",
  },
};

describe("getOperationalDashboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the operational dashboard summary and returns the validated data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getOperationalDashboard(ORGANIZATION_ID, EMPLOYEE_ID)).resolves.toEqual(response.data);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/organizations/org-1/operational-dashboard?employeeId=emp-1",
      expect.objectContaining({
        headers: expect.any(Headers),
        method: "GET",
      }),
    );
  });

  it("throws the structured API message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "ForbiddenError", message: "Acesso restrito à diretoria." }), {
          status: 403,
        }),
      ),
    );

    await expect(getOperationalDashboard(ORGANIZATION_ID, EMPLOYEE_ID)).rejects.toThrow(
      "Acesso restrito à diretoria.",
    );
  });

  it("rejects payloads that violate the response contract", async () => {
    const invalid = { data: { ...response.data, metrics: [{ ...response.data.metrics[0], icon: "not-an-icon" }] } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(invalid), { status: 200 })));

    await expect(getOperationalDashboard(ORGANIZATION_ID, EMPLOYEE_ID)).rejects.toThrow();
  });
});
