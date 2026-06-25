import type { FastifyPluginAsync } from "fastify";
import { GetOperationalDashboardUseCase } from "../../../application/operational-dashboard/get-operational-dashboard-use-case.js";
import type { OperationalDashboardRepository } from "../../../application/operational-dashboard/operational-dashboard-repository.js";
import { InMemoryOperationalDashboardRepository } from "../../../infrastructure/operational-dashboard/in-memory-operational-dashboard-repository.js";

export type OperationalDashboardRoutesOptions = {
  operationalDashboardRepository?: OperationalDashboardRepository;
};

export function operationalDashboardRoutes(options: OperationalDashboardRoutesOptions = {}): FastifyPluginAsync {
  return async (app) => {
    const operationalDashboardRepository =
      options.operationalDashboardRepository ?? new InMemoryOperationalDashboardRepository();
    const getOperationalDashboardUseCase = new GetOperationalDashboardUseCase(operationalDashboardRepository);

    app.get("/operational/dashboard", async (request) => {
      const masterUser = await request.requireMaster();

      return getOperationalDashboardUseCase.execute(masterUser);
    });
  };
}
