import type { ListSubscriptionPlansResponse } from "@flora/shared/organizations";
import { apiFetch } from "@/lib/http";

export async function listSubscriptionPlans() {
  return apiFetch<ListSubscriptionPlansResponse>("/subscription-plans", {
    method: "GET",
  });
}
