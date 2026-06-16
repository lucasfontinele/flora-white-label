"use client";

import { useQuery } from "@tanstack/react-query";
import { getCatalog } from "../requests/get-catalog";

export function useCatalogQuery() {
  return useQuery({
    queryKey: ["associated", "catalog"],
    queryFn: getCatalog,
  });
}
