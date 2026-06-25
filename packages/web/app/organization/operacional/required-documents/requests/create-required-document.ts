import { apiFetch } from "@/lib/http";
import type { RequiredDocument, RequiredDocumentWriteBody } from "../types";

export async function createRequiredDocument(
  organizationId: string,
  body: RequiredDocumentWriteBody,
) {
  return apiFetch<RequiredDocument>(`/organizations/${organizationId}/required-documents`, {
    method: "POST",
    body: JSON.stringify(body),
    skipMasterHeaders: true,
  });
}
