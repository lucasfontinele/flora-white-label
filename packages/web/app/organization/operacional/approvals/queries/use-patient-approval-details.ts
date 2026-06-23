"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvePatientDocument, rejectPatientDocument } from "../requests/document-actions";
import { getPatientApprovalDetails } from "../requests/get-patient-approval-details";
import {
  approvePatientRegistration,
  rejectPatientRegistration,
} from "../requests/registration-actions";

export const patientApprovalDetailsQueryKey = (organizationId: string, patientId: string) =>
  ["organization", "patient-approval-details", organizationId, patientId] as const;

export function usePatientApprovalDetails(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: patientApprovalDetailsQueryKey(organizationId, patientId),
    queryFn: () => getPatientApprovalDetails(organizationId, patientId),
    enabled: organizationId.length > 0 && patientId.length > 0,
  });
}

export function usePatientApprovalMutations(organizationId: string, patientId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: patientApprovalDetailsQueryKey(organizationId, patientId),
    });
    // Refresh every status list since the patient may move between queues.
    void queryClient.invalidateQueries({ queryKey: ["organization", "patients", organizationId] });
  };

  const approveDocument = useMutation({
    mutationFn: ({ approvalId, organizationUserId }: { approvalId: string; organizationUserId: string }) =>
      approvePatientDocument(organizationId, patientId, approvalId, organizationUserId),
    onSuccess: invalidate,
  });

  const rejectDocument = useMutation({
    mutationFn: ({
      approvalId,
      organizationUserId,
      reason,
    }: {
      approvalId: string;
      organizationUserId: string;
      reason: string;
    }) => rejectPatientDocument(organizationId, patientId, approvalId, organizationUserId, reason),
    onSuccess: invalidate,
  });

  const approveRegistration = useMutation({
    mutationFn: () => approvePatientRegistration(organizationId, patientId),
    onSuccess: invalidate,
  });

  const rejectRegistration = useMutation({
    mutationFn: ({ reason }: { reason: string }) =>
      rejectPatientRegistration(organizationId, patientId, reason),
    onSuccess: invalidate,
  });

  return { approveDocument, rejectDocument, approveRegistration, rejectRegistration };
}
