import { apiFetch } from "@/lib/http";

export async function deleteOrganization(id: string) {
  return apiFetch<void>(`/backoffice/organizations/${id}`, {
    method: "DELETE",
  });
}
