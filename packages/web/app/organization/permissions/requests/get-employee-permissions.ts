import { apiFetch } from "@/lib/http";
import type { EmployeePermissions } from "../types";

export async function getEmployeePermissions(organizationId: string, employeeId: string) {
  return apiFetch<EmployeePermissions>(
    `/organizations/${organizationId}/employees/${employeeId}/permissions`,
    {
      method: "GET",
      skipMasterHeaders: true,
    },
  );
}
