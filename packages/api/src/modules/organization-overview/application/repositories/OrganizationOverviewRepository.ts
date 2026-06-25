import type { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";

/**
 * Read-only port for the lightweight, organization-scoped counts shown in the
 * operational sidebar. It only exposes aggregate counts (no entity hydration),
 * so the use case stays free of persistence details.
 */
export interface OrganizationOverviewRepository {
  countOrders(organizationId: string): Promise<number>;
  countPatientsByStatus(organizationId: string, status: PatientStatus): Promise<number>;
}
