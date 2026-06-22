import { apiFetch } from "@/lib/http";
import type { ListSubscriptionPlansResponse } from "../types";

export async function listSubscriptionPlans() {
  return apiFetch<ListSubscriptionPlansResponse>("/backoffice/subscription-plans", {
    method: "GET",
  });
}
