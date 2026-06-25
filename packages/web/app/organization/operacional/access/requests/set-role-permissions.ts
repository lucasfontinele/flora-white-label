import { apiFetch } from "@/lib/http";
import type { Role, RolePermission } from "../types";

export async function setRolePermissions(
  organizationId: string,
  roleId: string,
  permissions: RolePermission[],
) {
  return apiFetch<Role>(`/organizations/${organizationId}/roles/${roleId}/permissions`, {
    method: "PUT",
    skipMasterHeaders: true,
    body: JSON.stringify({ permissions }),
  });
}
