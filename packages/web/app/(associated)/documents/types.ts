// Shapes for the patient-facing document endpoints.

// GET /organizations/:organizationId/required-documents
export type RequiredDocument = {
  id: string;
  organizationId: string;
  name: string;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListRequiredDocumentsResponse = {
  data: RequiredDocument[];
};

export type DocumentApprovalStatus = "PENDING" | "REJECTED" | "APPROVED";

// GET /organizations/:organizationId/patients/:patientId/document-approvals
export type PatientDocumentApproval = {
  id: string;
  organizationId: string;
  documentId: string;
  patientId: string;
  status: DocumentApprovalStatus;
  rejectedReason: string | null;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  storageKey: string | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListPatientDocumentApprovalsResponse = {
  data: PatientDocumentApproval[];
};

// A required document merged with the patient's current approval (if any).
export type PatientDocumentItem = {
  document: RequiredDocument;
  approval: PatientDocumentApproval | null;
};
