import { apiFetch } from "@/lib/http";
import type { RequiredDocument, RequiredDocumentWriteBody } from "../types";

export async function updateRequiredDocument(
  organizationId: string,
  documentId: string,
  body: RequiredDocumentWriteBody,
) {
  return apiFetch<RequiredDocument>(
    `/organizations/${organizationId}/required-documents/${documentId}`,
    { method: "PUT", body: JSON.stringify(body), skipMasterHeaders: true },
  );
}
