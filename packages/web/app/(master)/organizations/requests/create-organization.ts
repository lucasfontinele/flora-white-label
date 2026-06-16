import type { CreateOrganizationRequest, CreateOrganizationResponse } from "@flora/shared/organizations";
import { apiFetch } from "@/lib/http";

export async function createOrganization(input: CreateOrganizationRequest) {
  return apiFetch<CreateOrganizationResponse>("/organizations", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
