import { afterEach, describe, expect, it, vi } from "vitest";
import { getOperationalDashboard } from "./get-operational-dashboard";

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

    await expect(getOperationalDashboard()).resolves.toEqual(response.data);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/operational/dashboard",
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
        new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Usuário não autorizado." } }), {
          status: 403,
        }),
      ),
    );

    await expect(getOperationalDashboard()).rejects.toThrow("Usuário não autorizado.");
  });

  it("rejects payloads that violate the response contract", async () => {
    const invalid = { data: { ...response.data, metrics: [{ ...response.data.metrics[0], icon: "not-an-icon" }] } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(invalid), { status: 200 })));

    await expect(getOperationalDashboard()).rejects.toThrow();
  });
});
