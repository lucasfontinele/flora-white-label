import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { OrganizationEmployee } from "../../domain/entities/OrganizationEmployee.js";

/** Lightweight projection used for role/permission resolution. */
export interface OrganizationEmployeeRoleAssignment {
  id: string;
  organizationId: string;
  roleId: string | null;
}

export interface OrganizationEmployeeRepository {
  findById(id: string): Promise<OrganizationEmployee | null>;
  findByDocument(organizationId: string, document: Document): Promise<OrganizationEmployee | null>;
  /**
   * Returns just the employee's organization and assigned role, without
   * hydrating the full domain entity (so it never depends on the stored
   * document being a valid CPF).
   */
  findRoleAssignment(employeeId: string): Promise<OrganizationEmployeeRoleAssignment | null>;
  create(employee: OrganizationEmployee): Promise<void>;
}
