"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPatientPrescriber } from "../requests/create-patient-prescriber";
import { deletePatientPrescriber } from "../requests/delete-patient-prescriber";
import { listPatientPrescribers } from "../requests/list-patient-prescribers";
import { updatePatientPrescriber } from "../requests/update-patient-prescriber";
import type { PrescriberWriteBody } from "../types";

export const patientPrescribersQueryKey = (organizationId: string, patientId: string) =>
  ["associated", "patient-prescribers", organizationId, patientId] as const;

export function usePatientPrescribers(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: patientPrescribersQueryKey(organizationId, patientId),
    queryFn: () => listPatientPrescribers(organizationId, patientId),
    enabled: organizationId.length > 0 && patientId.length > 0,
  });
}

export function useCreatePatientPrescriber(organizationId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PrescriberWriteBody) =>
      createPatientPrescriber(organizationId, patientId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: patientPrescribersQueryKey(organizationId, patientId),
      }),
  });
}

export function useUpdatePatientPrescriber(organizationId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prescriberId, body }: { prescriberId: string; body: PrescriberWriteBody }) =>
      updatePatientPrescriber(organizationId, patientId, prescriberId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: patientPrescribersQueryKey(organizationId, patientId),
      }),
  });
}

export function useDeletePatientPrescriber(organizationId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescriberId: string) =>
      deletePatientPrescriber(organizationId, patientId, prescriberId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: patientPrescribersQueryKey(organizationId, patientId),
      }),
  });
}
