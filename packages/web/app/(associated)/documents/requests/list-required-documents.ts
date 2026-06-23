import { apiFetch } from "@/lib/http";
import type { ListRequiredDocumentsResponse } from "../types";

export async function listRequiredDocuments(organizationId: string) {
  return apiFetch<ListRequiredDocumentsResponse>(
    `/organizations/${organizationId}/required-documents`,
    { method: "GET", skipMasterHeaders: true },
  );
}
