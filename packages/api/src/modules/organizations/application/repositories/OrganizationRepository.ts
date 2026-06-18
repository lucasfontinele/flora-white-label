import type { Organization } from "../../domain/entities/Organization.js";
import type { Cnpj } from "../../domain/value-objects/Cnpj.js";

export interface OrganizationAddressReadModel {
  id: string;
  title: string | null;
  zipcode: string;
  street: string;
  neighborhood: string;
  complement: string | null;
  city: string;
  state: string;
}

export interface OrganizationCurrentPlanReadModel {
  id: string;
  title: string;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
}

export interface OrganizationReadModel {
  id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  currentPlan: OrganizationCurrentPlanReadModel;
  address: OrganizationAddressReadModel;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationRepository {
  findByCnpj(cnpj: Cnpj): Promise<Organization | null>;
  findByCnpjExcludingId(cnpj: Cnpj, id: string): Promise<Organization | null>;
  findById(id: string): Promise<Organization | null>;
  findDetailsById(id: string): Promise<OrganizationReadModel | null>;
  findAllDetails(): Promise<OrganizationReadModel[]>;
  create(organization: Organization): Promise<void>;
  save(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
