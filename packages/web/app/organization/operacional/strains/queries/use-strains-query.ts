"use client";

import { useQuery } from "@tanstack/react-query";
import { getStrains } from "../requests/get-strains";

export function useStrainsQuery() {
  return useQuery({ queryKey: ["organization", "strains"], queryFn: getStrains });
}
