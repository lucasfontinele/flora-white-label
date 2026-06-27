// Shapes for the /organizations/:organizationId/prescriptions endpoints.

export type PrescriptionPeriod = "MONTHLY" | "ANNUAL";

export const PRESCRIPTION_PERIOD_LABELS: Record<PrescriptionPeriod, string> = {
  MONTHLY: "Mensal",
  ANNUAL: "Anual",
};

export type PrescriptionItemScope = "PRODUCT" | "CATEGORY";

export type PrescriptionItem = {
  id: string;
  scope: PrescriptionItemScope;
  productId: string | null;
  productName: string | null;
  productUnit: string | null;
  category: string | null;
  allowedQuantity: number;
  period: PrescriptionPeriod;
  notes: string | null;
};

export type Prescription = {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  issuedAt: string; // ISO date-time
  validUntil: string; // ISO date-time (issuedAt + 6 months)
  observations: string | null;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/prescriptions
export type ListPrescriptionsResponse = {
  data: Prescription[];
};

// GET /organizations/:organizationId/patients/:patientId/prescription
export type GetPrescriptionResponse = {
  prescription: Prescription | null;
};

// One posology line of the write body. A line is scoped either to a specific
// product (productId) or to a whole category (category).
export type PrescriptionItemWriteBody = {
  scope: PrescriptionItemScope;
  productId: string | null;
  category: string | null;
  allowedQuantity: number;
  period: PrescriptionPeriod;
  notes: string | null;
};

// Body for PUT /organizations/:organizationId/patients/:patientId/prescription.
// validUntil is derived server-side from issuedAt (+6 months).
export type PrescriptionWriteBody = {
  issuedAt: string; // "YYYY-MM-DD" (date input) or ISO date-time
  observations: string | null;
  items: PrescriptionItemWriteBody[];
};

// One row of the standalone screen: an approved patient with their prescription.
export type PrescriptionRow = {
  patientId: string;
  patientName: string;
  guardianName: string | null;
  prescription: Prescription | null;
};
