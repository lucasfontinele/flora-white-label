import { apiFetch } from "@/lib/http";
import type { CreateOrganizationInput, CreatedOrganization } from "../types";

type CreateOrganizationResponse = {
  data: CreatedOrganization;
};

export async function createOrganization(input: CreateOrganizationInput) {
  return apiFetch<CreateOrganizationResponse>("/organizations", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
