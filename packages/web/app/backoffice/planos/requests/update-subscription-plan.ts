import { apiFetch } from "@/lib/http";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";
import type { BackofficeSubscriptionPlan } from "../types";

export async function updateSubscriptionPlan(id: string, payload: SubscriptionPlanPayload) {
  return apiFetch<BackofficeSubscriptionPlan>(`/backoffice/subscription-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
