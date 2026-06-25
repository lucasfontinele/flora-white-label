import { describe, expect, it } from "vitest";
import type { OperationalDashboardDto } from "@flora/shared/operational-dashboard";
import type { OperationalDashboardRepository } from "../../../application/operational-dashboard/operational-dashboard-repository.js";
import { buildServer } from "../build-server.js";

const summary: OperationalDashboardDto = {
  lowStock: [{ amount: "4 un.", name: "Óleo CBD 17% - 30ml", tone: "error" }],
  metrics: [{ delta: "+4", hint: "aguardando ação", icon: "inbox", label: "Pedidos pendentes", value: "12" }],
  ordersByStatus: [{ count: 12, status: "Solicitado" }],
  referenceLabel: "Junho 2026",
};

function buildOptions() {
  const operationalDashboardRepository: OperationalDashboardRepository = {
    async getSummary() {
      return summary;
    },
  };

  return { operationalDashboardRepository };
}

describe("operational dashboard routes", () => {
  it("returns the operational dashboard summary for an authenticated Master", async () => {
    const app = await buildServer(buildOptions());

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "GET",
      url: "/operational/dashboard",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: summary });
  });

  it("rejects missing Master authentication", async () => {
    const app = await buildServer(buildOptions());

    const response = await app.inject({
      method: "GET",
      url: "/operational/dashboard",
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects non-Master users", async () => {
    const app = await buildServer(buildOptions());

    const response = await app.inject({
      headers: {
        "x-master-role": "operator",
        "x-master-user-id": "user_1",
      },
      method: "GET",
      url: "/operational/dashboard",
    });

    expect(response.statusCode).toBe(403);
  });
});
