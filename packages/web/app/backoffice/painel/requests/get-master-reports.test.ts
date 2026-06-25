import { afterEach, describe, expect, it, vi } from "vitest";
import { getMasterReports } from "./get-master-reports";

const USER_ID = "master-1";

const response = {
  data: {
    metrics: [
      { delta: "+5", hint: "novas no mês", icon: "store", label: "Organizações ativas", tone: "success", value: "48" },
    ],
    monthlyOrganizations: {
      growthLabel: "+54% no semestre",
      points: [{ month: "Jan", value: 31 }],
    },
    networkHealth: [{ icon: "bar-chart-3", label: "Ticket médio por pedido", value: "R$ 312" }],
    planDistribution: [{ name: "Starter", organizations: 22, percentage: 46 }],
    recentOrganizations: [
      { createdAt: "12 jun 2026", city: "Palmas", plan: "Growth", state: "TO", tradeName: "Verde Vida" },
    ],
    referenceLabel: "Junho 2026",
  },
};

describe("getMasterReports", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the whole network and forwards the master user id header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getMasterReports(USER_ID, [])).resolves.toEqual(response.data);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3333/backoffice/reports");
    expect((init.headers as Headers).get("x-master-user-id")).toBe(USER_ID);
  });

  it("encodes the selected organizations into the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await getMasterReports(USER_ID, ["org-1", "org-2"]);

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3333/backoffice/reports?organizationIds=org-1%2Corg-2",
    );
  });

  it("throws the structured API message when the request is forbidden", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "ForbiddenError", message: "Acesso restrito a usuários master." }),
          { status: 403 },
        ),
      ),
    );

    await expect(getMasterReports(USER_ID, [])).rejects.toThrow("Acesso restrito a usuários master.");
  });

  it("rejects payloads that violate the response contract", async () => {
    const invalid = {
      data: { ...response.data, metrics: [{ ...response.data.metrics[0], icon: "not-an-icon" }] },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(invalid), { status: 200 })));

    await expect(getMasterReports(USER_ID, [])).rejects.toThrow();
  });
});
