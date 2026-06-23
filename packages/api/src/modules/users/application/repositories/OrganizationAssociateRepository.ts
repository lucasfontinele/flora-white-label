export type AssociateType = "GUARDIAN" | "PATIENT";

export interface AssociateReadModel {
  userId: string;
  email: string;
  type: AssociateType;
  name: string;
  patientNames: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface AssociateFilters {
  search?: string;
  type?: AssociateType;
  isActive?: boolean;
}

export interface OrganizationAssociateRepository {
  findAssociates(
    organizationId: string,
    filters: AssociateFilters,
  ): Promise<AssociateReadModel[]>;
}
