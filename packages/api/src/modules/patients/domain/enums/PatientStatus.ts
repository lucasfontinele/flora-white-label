/**
 * Lifecycle of a patient's association request, driven by document submission
 * and the organization's review:
 * - WAITING_DOCUMENTS: registered, still missing required uploads.
 * - WAITING_APPROVAL: all required documents uploaded, awaiting employee review.
 * - APPROVAL: registration approved (every document approved).
 * - REJECTED: registration rejected (carries a reason).
 */
export enum PatientStatus {
  WaitingDocuments = "WAITING_DOCUMENTS",
  WaitingApproval = "WAITING_APPROVAL",
  Approval = "APPROVAL",
  Rejected = "REJECTED",
}
