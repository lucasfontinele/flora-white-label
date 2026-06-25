import { apiFetch } from "@/lib/http";

export async function deleteSubscriptionPlan(id: string) {
  return apiFetch<void>(`/backoffice/subscription-plans/${id}`, {
    method: "DELETE",
  });
}
