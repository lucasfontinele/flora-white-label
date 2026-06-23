"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPatientDocumentApprovals } from "../requests/list-patient-document-approvals";
import { listRequiredDocuments } from "../requests/list-required-documents";
import { uploadPatientDocument } from "../requests/upload-patient-document";

export const requiredDocumentsQueryKey = (organizationId: string) =>
  ["associated", "required-documents", organizationId] as const;

export const patientApprovalsQueryKey = (organizationId: string, patientId: string) =>
  ["associated", "patient-document-approvals", organizationId, patientId] as const;

export function useRequiredDocuments(organizationId: string) {
  return useQuery({
    queryKey: requiredDocumentsQueryKey(organizationId),
    queryFn: () => listRequiredDocuments(organizationId),
    enabled: organizationId.length > 0,
  });
}

export function usePatientDocumentApprovals(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: patientApprovalsQueryKey(organizationId, patientId),
    queryFn: () => listPatientDocumentApprovals(organizationId, patientId),
    enabled: organizationId.length > 0 && patientId.length > 0,
  });
}

export function useUploadPatientDocument(organizationId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, file }: { documentId: string; file: File }) =>
      uploadPatientDocument(organizationId, patientId, documentId, file),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: patientApprovalsQueryKey(organizationId, patientId),
      }),
  });
}
