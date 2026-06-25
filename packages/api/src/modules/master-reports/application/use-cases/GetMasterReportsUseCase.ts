import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import type { MasterAccessRepository } from "../repositories/MasterAccessRepository.js";
import type {
  MasterReports,
  MasterReportsRepository,
} from "../repositories/MasterReportsRepository.js";

export interface GetMasterReportsInput {
  /** Identity of the requester, taken from the `x-master-user-id` header. */
  requesterUserId: string;
  /**
   * Organizations to scope the report to. Empty means "the whole network".
   */
  organizationIds: string[];
}

export interface GetMasterReportsDependencies {
  masterAccessRepository: MasterAccessRepository;
  reportsRepository: MasterReportsRepository;
}

/**
 * Returns the consolidated network reports for the backoffice master dashboard.
 * Access is restricted to Master users (the platform operators): anyone else —
 * including organization employees — gets a 403. The report can span the whole
 * network or just the organizations the master selected.
 */
export class GetMasterReportsUseCase {
  constructor(private readonly deps: GetMasterReportsDependencies) {}

  async execute(input: GetMasterReportsInput): Promise<MasterReports> {
    const requesterUserId = input.requesterUserId.trim();

    if (requesterUserId.length === 0) {
      throw new ForbiddenError("Acesso restrito a usuários master.");
    }

    const isMaster = await this.deps.masterAccessRepository.isMaster(requesterUserId);

    if (!isMaster) {
      throw new ForbiddenError("Acesso restrito a usuários master.");
    }

    return this.deps.reportsRepository.getReports({
      organizationIds: input.organizationIds,
    });
  }
}
