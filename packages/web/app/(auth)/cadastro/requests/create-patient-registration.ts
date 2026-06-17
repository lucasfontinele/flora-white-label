import type {
  CreatePatientRegistrationRequest,
  CreatePatientRegistrationResponse,
} from "@flora/shared/patients";
import { apiFetch } from "@/lib/http";

export async function createPatientRegistration(input: CreatePatientRegistrationRequest) {
  return apiFetch<CreatePatientRegistrationResponse>("/patient-registrations", {
    body: JSON.stringify(input),
    method: "POST",
    skipMasterHeaders: true,
  });
}
