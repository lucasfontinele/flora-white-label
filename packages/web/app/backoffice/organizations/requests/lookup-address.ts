import { apiFetch } from "@/lib/http";
import type { ZipcodeAddress } from "../types";

export async function lookupAddressByZipcode(zipcode: string) {
  const digits = zipcode.replace(/\D/g, "");

  return apiFetch<ZipcodeAddress>(`/addresses/zipcode/${digits}`, {
    method: "GET",
  });
}
