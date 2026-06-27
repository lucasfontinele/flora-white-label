// Shapes for the patient-facing prescriber endpoints.
// /organizations/:organizationId/patients/:patientId/prescribers

export type Prescriber = {
  id: string;
  organizationId: string;
  patientId: string;
  fullName: string;
  crm: string;
  crmState: string;
  createdAt: string;
  updatedAt: string;
};

export type ListPrescribersResponse = {
  data: Prescriber[];
};

// Body for POST/PUT — the editable fields of a prescriber.
export type PrescriberWriteBody = {
  fullName: string;
  crm: string;
  crmState: string;
};
