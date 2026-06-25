"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSubscriptionPlan } from "../requests/create-subscription-plan";
import { deleteSubscriptionPlan } from "../requests/delete-subscription-plan";
import { listSubscriptionPlans } from "../requests/list-subscription-plans";
import { updateSubscriptionPlan } from "../requests/update-subscription-plan";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";

export const subscriptionPlansQueryKey = ["master", "backoffice", "subscription-plans"] as const;

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionPlansQueryKey,
    queryFn: listSubscriptionPlans,
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionPlanPayload) => createSubscriptionPlan(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey }),
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubscriptionPlanPayload }) =>
      updateSubscriptionPlan(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey }),
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey }),
  });
}
