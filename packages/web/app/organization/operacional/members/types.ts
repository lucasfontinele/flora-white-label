// Shapes for the /organizations/:orgId/associates endpoints.

export type AssociateType = "GUARDIAN" | "PATIENT";

export type Associate = {
  userId: string;
  email: string;
  type: AssociateType;
  name: string;
  patientNames: string[];
  isActive: boolean;
  createdAt: string;
};

export type ListAssociatesResponse = { data: Associate[] };

export type AssociateFilters = {
  search?: string;
  type?: AssociateType;
  status?: "active" | "disabled";
};
