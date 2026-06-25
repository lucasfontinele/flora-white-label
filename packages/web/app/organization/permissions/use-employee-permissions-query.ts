"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployeePermissions } from "./requests/get-employee-permissions";

export const employeePermissionsQueryKey = (organizationId: string, employeeId: string) =>
  ["organization", "employee-permissions", organizationId, employeeId] as const;

export function useEmployeePermissionsQuery(organizationId: string, employeeId: string) {
  return useQuery({
    queryKey: employeePermissionsQueryKey(organizationId, employeeId),
    queryFn: () => getEmployeePermissions(organizationId, employeeId),
    enabled: organizationId.length > 0 && employeeId.length > 0,
    staleTime: 5 * 60_000,
  });
}
