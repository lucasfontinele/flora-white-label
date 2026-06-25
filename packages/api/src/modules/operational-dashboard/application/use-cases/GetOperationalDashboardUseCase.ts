import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import type {
  OperationalDashboardRepository,
  OperationalDashboardSummary,
} from "../repositories/OperationalDashboardRepository.js";

export interface GetOperationalDashboardInput {
  organizationId: string;
  /** The employee making the request, used to authorize access. */
  employeeId: string;
}

/**
 * Minimal view of the access-control read path this use case needs to authorize
 * the request. `GetEmployeePermissionsUseCase` satisfies it structurally.
 */
export interface EmployeePermissionsReader {
  execute(input: {
    organizationId: string;
    employeeId: string;
  }): Promise<{ fullAccess: boolean; viewAll: boolean }>;
}

export interface GetOperationalDashboardDependencies {
  getEmployeePermissionsUseCase: EmployeePermissionsReader;
  dashboardRepository: OperationalDashboardRepository;
}

/**
 * Returns the operational overview for an organization. Access is restricted to
 * "diretoria pra cima": only roles that view everything (Diretoria and Super
 * administrador, i.e. `viewAll`/`fullAccess`) may load this screen. Anyone else
 * gets a 403.
 */
export class GetOperationalDashboardUseCase {
  constructor(private readonly deps: GetOperationalDashboardDependencies) {}

  async execute(input: GetOperationalDashboardInput): Promise<OperationalDashboardSummary> {
    const permissions = await this.deps.getEmployeePermissionsUseCase.execute({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
    });

    if (!permissions.fullAccess && !permissions.viewAll) {
      throw new ForbiddenError("Acesso restrito à diretoria.");
    }

    return this.deps.dashboardRepository.getSummary(input.organizationId);
  }
}
