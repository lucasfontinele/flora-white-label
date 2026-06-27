"use client";

import { useQuery } from "@tanstack/react-query";
import { getCatalog } from "../requests/get-catalog";

export function useCatalogQuery(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: ["associated", "catalog", organizationId, patientId],
    queryFn: () => getCatalog(organizationId, patientId),
    enabled: organizationId.length > 0 && patientId.length > 0,
  });
}
