"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientPrescribers } from "../requests/get-patient-prescribers";

export const patientPrescribersQueryKey = (organizationId: string, patientId: string) =>
  ["organization", "patient-prescribers", organizationId, patientId] as const;

export function usePatientPrescribers(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: patientPrescribersQueryKey(organizationId, patientId),
    queryFn: () => getPatientPrescribers(organizationId, patientId),
    enabled: organizationId.length > 0 && patientId.length > 0,
  });
}
