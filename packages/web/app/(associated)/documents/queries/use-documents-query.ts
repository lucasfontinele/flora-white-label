"use client";

import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "../requests/get-documents";

export function useDocumentsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["associated", "documents", patientId],
    queryFn: () => getDocuments(patientId),
  });
}
