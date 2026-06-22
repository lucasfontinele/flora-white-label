"use client";

import { useQuery } from "@tanstack/react-query";
import { getReports } from "../requests/get-reports";

export function useReportsQuery() {
  return useQuery({ queryKey: ["organization", "reports"], queryFn: getReports });
}
