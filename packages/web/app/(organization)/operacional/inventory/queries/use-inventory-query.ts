"use client";

import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../requests/get-inventory";

export function useInventoryQuery() {
  return useQuery({ queryKey: ["organization", "inventory"], queryFn: getInventory });
}
