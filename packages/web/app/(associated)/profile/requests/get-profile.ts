import { associatedUser, tenant } from "@/lib/data";

export async function getProfile() {
  return { associatedUser, tenant };
}
