import { rolePermissions } from "@/lib/data";

export async function getAccessRoles() {
  return rolePermissions;
}
