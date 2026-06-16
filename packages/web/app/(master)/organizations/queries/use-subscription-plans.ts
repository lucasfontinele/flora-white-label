"use client";

import { useQuery } from "@tanstack/react-query";
import { listSubscriptionPlans } from "../requests/list-subscription-plans";

export const subscriptionPlansQueryKey = ["master", "subscription-plans"] as const;

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionPlansQueryKey,
    queryFn: listSubscriptionPlans,
  });
}
