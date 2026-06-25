import type { GetOperationalDashboardResponse } from "@flora/shared/operational-dashboard";
import type { MasterUserContext } from "../../communication/http/plugins/master-auth.js";
import type { OperationalDashboardRepository } from "./operational-dashboard-repository.js";

export class GetOperationalDashboardUseCase {
  constructor(private readonly operationalDashboardRepository: OperationalDashboardRepository) {}

  async execute(_masterUser: MasterUserContext): Promise<GetOperationalDashboardResponse> {
    const summary = await this.operationalDashboardRepository.getSummary();

    return {
      data: summary,
    };
  }
}
