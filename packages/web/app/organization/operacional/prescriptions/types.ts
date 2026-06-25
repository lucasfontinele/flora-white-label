// Shapes for the /organizations/:organizationId/prescriptions endpoints.

export type Prescription = {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  validUntil: string; // ISO date-time
  observations: string | null;
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/prescriptions
export type ListPrescriptionsResponse = {
  data: Prescription[];
};

// Body for PUT /organizations/:organizationId/patients/:patientId/prescription
export type PrescriptionWriteBody = {
  validUntil: string; // "YYYY-MM-DD" (date input) or ISO date-time
  observations: string | null;
};

// One row of the screen: an approved patient with their prescription (if any).
export type PrescriptionRow = {
  patientId: string;
  patientName: string;
  guardianName: string | null;
  prescription: Prescription | null;
};
