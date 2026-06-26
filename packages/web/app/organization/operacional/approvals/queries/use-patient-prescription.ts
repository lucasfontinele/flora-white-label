"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrescription } from "../../prescriptions/requests/get-prescription";
import { upsertPrescription } from "../../prescriptions/requests/upsert-prescription";
import type { PrescriptionWriteBody } from "../../prescriptions/types";

export const patientPrescriptionQueryKey = (organizationId: string, patientId: string) =>
  ["organization", "patient-prescription", organizationId, patientId] as const;

export function usePatientPrescription(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: patientPrescriptionQueryKey(organizationId, patientId),
    queryFn: () => getPrescription(organizationId, patientId),
    enabled: organizationId.length > 0 && patientId.length > 0,
  });
}

export function useUpsertPatientPrescription(organizationId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PrescriptionWriteBody) =>
      upsertPrescription(organizationId, patientId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: patientPrescriptionQueryKey(organizationId, patientId),
      });
      // The standalone prescriptions screen lists the same data.
      void queryClient.invalidateQueries({
        queryKey: ["organization", "prescriptions", organizationId],
      });
    },
  });
}
