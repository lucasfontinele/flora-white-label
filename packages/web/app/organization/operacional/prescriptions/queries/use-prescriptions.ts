"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePrescription } from "../requests/delete-prescription";
import { listPrescriptions } from "../requests/list-prescriptions";
import { upsertPrescription } from "../requests/upsert-prescription";
import type { PrescriptionWriteBody } from "../types";

export const prescriptionsQueryKey = (organizationId: string) =>
  ["organization", "prescriptions", organizationId] as const;

export function usePrescriptions(organizationId: string) {
  return useQuery({
    queryKey: prescriptionsQueryKey(organizationId),
    queryFn: () => listPrescriptions(organizationId),
    enabled: organizationId.length > 0,
  });
}

export function useUpsertPrescription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, body }: { patientId: string; body: PrescriptionWriteBody }) =>
      upsertPrescription(organizationId, patientId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: prescriptionsQueryKey(organizationId) }),
  });
}

export function useDeletePrescription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => deletePrescription(organizationId, patientId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: prescriptionsQueryKey(organizationId) }),
  });
}
