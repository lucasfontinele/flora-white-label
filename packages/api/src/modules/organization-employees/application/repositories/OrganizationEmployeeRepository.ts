import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { OrganizationEmployee } from "../../domain/entities/OrganizationEmployee.js";

export interface OrganizationEmployeeRepository {
  findById(id: string): Promise<OrganizationEmployee | null>;
  findByDocument(organizationId: string, document: Document): Promise<OrganizationEmployee | null>;
  create(employee: OrganizationEmployee): Promise<void>;
}
