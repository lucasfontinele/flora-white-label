"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessRoles } from "../requests/get-access-roles";

export function useAccessRolesQuery() {
  return useQuery({ queryKey: ["organization", "access"], queryFn: getAccessRoles });
}
