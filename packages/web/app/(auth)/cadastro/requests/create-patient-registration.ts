import { apiFetch } from "@/lib/http";
import type { PatientRegistrationBody, PatientRegistrationResponse } from "../types";

// White-label deploy: the portal serves a single association, so the target
// organization is configured per environment.
const defaultOrganizationId = process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? "org-vida-verde";

export async function createPatientRegistration(
  body: PatientRegistrationBody,
  organizationId: string = defaultOrganizationId,
) {
  return apiFetch<PatientRegistrationResponse>(`/organizations/${organizationId}/patient-registrations`, {
    body: JSON.stringify(body),
    method: "POST",
    skipMasterHeaders: true,
  });
}
