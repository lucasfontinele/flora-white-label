/**
 * Shared helpers for patient document uploads. Kept in one place so the
 * approval-scoped upload and the required-document-scoped (one-shot) upload
 * produce identical storage keys and audit actors.
 */
export function buildPatientDocumentStorageKey(input: {
  organizationId: string;
  patientId: string;
  approvalId: string;
  fileName: string;
  timestamp: number;
}): string {
  return [
    "organizations",
    input.organizationId,
    "patients",
    input.patientId,
    "documents",
    input.approvalId,
    `${input.timestamp}-${safeFileName(input.fileName)}`,
  ].join("/");
}

function safeFileName(fileName: string): string {
  const normalized = fileName
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return normalized.length > 0 ? normalized : "document";
}

export function normalizeUploadActorId(
  performedByUserId: string | undefined,
  patientId: string,
): string {
  const trimmed = performedByUserId?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : patientId;
}
