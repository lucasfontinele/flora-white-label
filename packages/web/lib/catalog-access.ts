import type { PatientRegistrationStatus } from "@flora/shared/authentication";

// Catalog access is gated by the selected patient's registration status, which
// arrives on the auth context (no extra request). A patient may only browse and
// buy once the association has approved them — anything other than `APPROVAL`
// (waiting documents/approval, rejected, or unknown) keeps the catalog locked.

export const APPROVED_PATIENT_STATUS: PatientRegistrationStatus = "APPROVAL";

/**
 * The single source of truth for "can this patient use the catalog?". Only an
 * approved patient passes; a missing status (passed as null/undefined) blocks.
 */
export function canAccessCatalog(status: PatientRegistrationStatus | null | undefined): boolean {
  return status === APPROVED_PATIENT_STATUS;
}
