"use client";

import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../requests/get-members";

export function useMembersQuery() {
  return useQuery({ queryKey: ["organization", "members"], queryFn: getMembers });
}
