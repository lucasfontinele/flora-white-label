"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../requests/create-product";
import { deleteProduct } from "../requests/delete-product";
import { listProducts } from "../requests/list-products";
import { removeProductCoverImage } from "../requests/remove-product-cover-image";
import { setProductStatus } from "../requests/set-product-status";
import { updateProduct } from "../requests/update-product";
import { uploadProductCoverImage } from "../requests/upload-product-cover-image";
import type { ProductWriteBody } from "../types";

export const productsQueryKey = (organizationId: string) =>
  ["organization", "products", organizationId] as const;

export function useProducts(organizationId: string) {
  return useQuery({
    queryKey: productsQueryKey(organizationId),
    queryFn: () => listProducts(organizationId),
    enabled: organizationId.length > 0,
  });
}

export function useCreateProduct(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProductWriteBody) => createProduct(organizationId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey(organizationId) }),
  });
}

export function useUpdateProduct(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: ProductWriteBody }) =>
      updateProduct(organizationId, productId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey(organizationId) }),
  });
}

export function useDeleteProduct(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(organizationId, productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey(organizationId) }),
  });
}

export function useUploadProductCoverImage(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductCoverImage(organizationId, productId, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey(organizationId) }),
  });
}

export function useRemoveProductCoverImage(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeProductCoverImage(organizationId, productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey(organizationId) }),
  });
}

export function useSetProductStatus(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      setProductStatus(organizationId, productId, isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey(organizationId) }),
  });
}
