import { apiFetch } from "@/lib/http";

export async function deleteRequiredDocument(organizationId: string, documentId: string) {
  return apiFetch<void>(`/organizations/${organizationId}/required-documents/${documentId}`, {
    method: "DELETE",
    skipMasterHeaders: true,
  });
}
