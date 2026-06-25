"use client";

import { useQuery } from "@tanstack/react-query";
import { listPatientDocumentApprovals } from "../../documents/requests/list-patient-document-approvals";
import { listRequiredDocuments } from "../../documents/requests/list-required-documents";
import { getPatientPrescription } from "../requests/get-patient-prescription";
import { listPatientOrders } from "../requests/list-patient-orders";

// The home pulls everything for the selected patient in one go: prescription
// validity, the patient's orders, and the documents needed to compute readiness.
export function useDashboardQuery(organizationId: string, patientId: string) {
  return useQuery({
    queryKey: ["associated", "dashboard", organizationId, patientId],
    enabled: organizationId.length > 0 && patientId.length > 0,
    queryFn: async () => {
      const [prescription, orders, requiredDocuments, approvals] = await Promise.all([
        getPatientPrescription(organizationId, patientId),
        listPatientOrders(organizationId, patientId),
        listRequiredDocuments(organizationId),
        listPatientDocumentApprovals(organizationId, patientId),
      ]);

      return {
        prescription: prescription.prescription,
        orders: orders.data,
        requiredDocuments: requiredDocuments.data,
        approvals: approvals.data,
      };
    },
  });
}
