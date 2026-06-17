import type { Organization } from "../../domain/entities/Organization.js";
import type { Cnpj } from "../../domain/value-objects/Cnpj.js";

export interface OrganizationRepository {
  findByCnpj(cnpj: Cnpj): Promise<Organization | null>;
  create(organization: Organization): Promise<void>;
}
