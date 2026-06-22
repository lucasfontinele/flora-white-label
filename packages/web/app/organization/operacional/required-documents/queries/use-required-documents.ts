"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRequiredDocument } from "../requests/create-required-document";
import { deleteRequiredDocument } from "../requests/delete-required-document";
import { listRequiredDocuments } from "../requests/list-required-documents";
import { updateRequiredDocument } from "../requests/update-required-document";
import type { RequiredDocumentWriteBody } from "../types";

export const requiredDocumentsQueryKey = (organizationId: string) =>
  ["organization", "required-documents", organizationId] as const;

export function useRequiredDocuments(organizationId: string) {
  return useQuery({
    queryKey: requiredDocumentsQueryKey(organizationId),
    queryFn: () => listRequiredDocuments(organizationId),
    enabled: organizationId.length > 0,
  });
}

export function useCreateRequiredDocument(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RequiredDocumentWriteBody) => createRequiredDocument(organizationId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: requiredDocumentsQueryKey(organizationId) }),
  });
}

export function useUpdateRequiredDocument(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, body }: { documentId: string; body: RequiredDocumentWriteBody }) =>
      updateRequiredDocument(organizationId, documentId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: requiredDocumentsQueryKey(organizationId) }),
  });
}

export function useDeleteRequiredDocument(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteRequiredDocument(organizationId, documentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: requiredDocumentsQueryKey(organizationId) }),
  });
}
