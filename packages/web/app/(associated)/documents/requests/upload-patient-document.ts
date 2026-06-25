import { apiFetch } from "@/lib/http";
import type { PatientDocumentApproval } from "../types";

export async function uploadPatientDocument(
  organizationId: string,
  patientId: string,
  documentId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<PatientDocumentApproval>(
    `/organizations/${organizationId}/patients/${patientId}/required-documents/${documentId}/upload`,
    { method: "POST", body: formData, skipMasterHeaders: true },
  );
}
