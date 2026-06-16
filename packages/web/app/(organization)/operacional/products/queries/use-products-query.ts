"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../requests/get-products";

export function useProductsQuery() {
  return useQuery({ queryKey: ["organization", "products"], queryFn: getProducts });
}
