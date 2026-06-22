import { apiFetch } from "@/lib/http";
import type { ListBackofficeSubscriptionPlansResponse } from "../types";

export async function listSubscriptionPlans() {
  return apiFetch<ListBackofficeSubscriptionPlansResponse>("/backoffice/subscription-plans", {
    method: "GET",
  });
}
