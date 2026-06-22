import { apiFetch } from "@/lib/http";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";
import type { BackofficeSubscriptionPlan } from "../types";

export async function createSubscriptionPlan(payload: SubscriptionPlanPayload) {
  return apiFetch<BackofficeSubscriptionPlan>("/backoffice/subscription-plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
