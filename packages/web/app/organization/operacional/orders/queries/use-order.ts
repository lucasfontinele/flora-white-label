"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrder } from "../requests/get-order";
import { listOrderPayments } from "../requests/list-order-payments";
import { listPatientDocumentApprovals } from "../requests/list-patient-document-approvals";
import { updateOrderStatus } from "../requests/update-order-status";
import type { OrderFulfillmentAction } from "../types";

export const orderQueryKey = (organizationId: string, orderId: string) =>
  ["organization", "order", organizationId, orderId] as const;

export const orderPaymentsQueryKey = (organizationId: string, orderId: string) =>
  ["organization", "order-payments", organizationId, orderId] as const;

export const patientDocumentsQueryKey = (organizationId: string, patientId: string) =>
  ["organization", "patient-documents", organizationId, patientId] as const;

export function useOrder(organizationId: string, orderId: string) {
  return useQuery({
    queryKey: orderQueryKey(organizationId, orderId),
    queryFn: () => getOrder(organizationId, orderId),
    enabled: organizationId.length > 0 && orderId.length > 0,
  });
}

export function useOrderPayments(organizationId: string, orderId: string) {
  return useQuery({
    queryKey: orderPaymentsQueryKey(organizationId, orderId),
    queryFn: () => listOrderPayments(organizationId, orderId),
    enabled: organizationId.length > 0 && orderId.length > 0,
  });
}

// `patientId` is only known after the order loads, so the query stays disabled
// until then to avoid firing against an empty id.
export function usePatientDocuments(organizationId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: patientDocumentsQueryKey(organizationId, patientId ?? ""),
    queryFn: () => listPatientDocumentApprovals(organizationId, patientId ?? ""),
    enabled: organizationId.length > 0 && Boolean(patientId),
  });
}

export function useUpdateOrderStatus(organizationId: string, orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: OrderFulfillmentAction) =>
      updateOrderStatus(organizationId, orderId, action),
    onSuccess: (order) => {
      // Seed the detail cache with the fresh order and refresh the list so both
      // views reflect the new status without a manual reload.
      queryClient.setQueryData(orderQueryKey(organizationId, orderId), order);
      void queryClient.invalidateQueries({ queryKey: ["organization", "orders", organizationId] });
    },
  });
}
