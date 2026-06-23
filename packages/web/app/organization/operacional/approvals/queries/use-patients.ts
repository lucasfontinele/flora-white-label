"use client";

import { useQuery } from "@tanstack/react-query";
import { listPatients } from "../requests/list-patients";
import type { PatientStatus } from "../types";

export const patientsQueryKey = (organizationId: string, status: PatientStatus) =>
  ["organization", "patients", organizationId, status] as const;

export function usePatients(organizationId: string, status: PatientStatus) {
  return useQuery({
    queryKey: patientsQueryKey(organizationId, status),
    queryFn: () => listPatients(organizationId, status),
    enabled: organizationId.length > 0,
  });
}
