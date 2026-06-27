// Shapes for the patient registration approval endpoints (org backoffice).

export type PatientStatus = "WAITING_DOCUMENTS" | "WAITING_APPROVAL" | "APPROVAL" | "REJECTED";

export type Patient = {
  id: string;
  name: string;
  document: string;
  birthdate: string;
  gender: string;
  underPrivileged: boolean;
  patientStatus: PatientStatus;
  rejectionReason: string | null;
  guardianName: string | null;
  createdAt: string;
};

// GET /organizations/:orgId/patients?status=
export type ListPatientsResponse = { data: Patient[] };

export type DocumentApprovalStatus = "PENDING" | "REJECTED" | "APPROVED";

export type RequiredDocument = {
  id: string;
  name: string;
  observations: string | null;
};

export type PatientDocumentApproval = {
  id: string;
  documentId: string;
  status: DocumentApprovalStatus;
  rejectedReason: string | null;
  fileName: string | null;
  fileUrl: string | null;
};

// GET /organizations/:orgId/patients/:patientId
export type PatientApprovalDetails = {
  patient: Patient;
  requiredDocuments: RequiredDocument[];
  approvals: PatientDocumentApproval[];
};

// GET /organizations/:orgId/patients/:patientId/prescribers
export type Prescriber = {
  id: string;
  fullName: string;
  crm: string;
  crmState: string;
};

export type ListPrescribersResponse = { data: Prescriber[] };
