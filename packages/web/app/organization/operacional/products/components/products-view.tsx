"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";
import { formatCentsAsCurrency, parseCurrencyToCents } from "@/lib/money";
import { Can } from "../../../permissions/can";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductsTable } from "./products-table";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useSetProductStatus,
  useUpdateProduct,
} from "../queries/use-products";
import type { ProductFormValues } from "../schemas/product-schema";
import type { Product, ProductWriteBody } from "../types";

type FormState = { mode: "create" | "edit"; product: Product | null };

function buildWriteBody(values: ProductFormValues): ProductWriteBody {
  const description = values.description.trim();
  const thc = values.thcPercentage.trim();
  const cbd = values.cbdPercentage.trim();

  return {
    name: values.name.trim(),
    description: description.length > 0 ? description : null,
    category: values.category,
    type: values.type,
    strainType: values.strainType === "" ? null : values.strainType,
    thcPercentage: thc.length > 0 ? Number(thc) : null,
    cbdPercentage: cbd.length > 0 ? Number(cbd) : null,
    unit: values.unit,
    priceInCents: parseCurrencyToCents(values.price),
  };
}

export function ProductsView({ organizationId }: { organizationId: string }) {
  const query = useProducts(organizationId);
  const createMutation = useCreateProduct(organizationId);
  const updateMutation = useUpdateProduct(organizationId);
  const deleteMutation = useDeleteProduct(organizationId);
  const statusMutation = useSetProductStatus(organizationId);
  const { toast } = useToast();

  const [formState, setFormState] = useState<FormState | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const products = query.data?.data ?? [];
  const isSavingForm = createMutation.isPending || updateMutation.isPending;
  const pendingStatusId = statusMutation.isPending
    ? (statusMutation.variables?.productId ?? null)
    : null;

  // Stable across background refetches so the open form is not reset while the
  // operator is typing.
  const formInitialValues = useMemo<ProductFormValues | undefined>(() => {
    const product = formState?.product;
    if (!product) return undefined;

    return {
      name: product.name,
      description: product.description ?? "",
      category: product.category,
      type: product.type,
      strainType: product.strainType ?? "",
      thcPercentage: product.thcPercentage !== null ? String(product.thcPercentage) : "",
      cbdPercentage: product.cbdPercentage !== null ? String(product.cbdPercentage) : "",
      unit: product.unit,
      price: formatCentsAsCurrency(product.priceInCents),
    };
  }, [formState]);

  function notifyError(error: unknown) {
    toast({
      variant: "error",
      title: "Algo deu errado",
      description: getApiErrorMessage(error),
    });
  }

  function openCreate() {
    createMutation.reset();
    setFormState({ mode: "create", product: null });
  }

  function openEdit(product: Product) {
    updateMutation.reset();
    setFormState({ mode: "edit", product });
  }

  function closeForm() {
    if (isSavingForm) return;
    setFormState(null);
  }

  function submitForm(values: ProductFormValues) {
    const body = buildWriteBody(values);

    if (formState?.mode === "edit" && formState.product) {
      updateMutation.mutate(
        { productId: formState.product.id, body },
        {
          onSuccess: () => {
            setFormState(null);
            toast({
              variant: "success",
              title: "Produto atualizado",
              description: `${body.name} foi atualizado com sucesso.`,
            });
          },
          onError: notifyError,
        },
      );
      return;
    }

    createMutation.mutate(body, {
      onSuccess: () => {
        setFormState(null);
        toast({
          variant: "success",
          title: "Produto cadastrado",
          description: `${body.name} foi adicionado ao catálogo.`,
        });
      },
      onError: notifyError,
    });
  }

  function toggleStatus(product: Product) {
    const nextActive = !product.isActive;

    statusMutation.mutate(
      { productId: product.id, isActive: nextActive },
      {
        onSuccess: () =>
          toast({
            variant: "success",
            title: nextActive ? "Produto ativado" : "Produto desativado",
            description: `${product.name} agora está ${nextActive ? "ativo" : "inativo"}.`,
          }),
        onError: notifyError,
      },
    );
  }

  function requestDelete(product: Product) {
    deleteMutation.reset();
    setProductToDelete(product);
  }

  function cancelDelete() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setProductToDelete(null);
  }

  function confirmDelete() {
    if (!productToDelete) return;
    const { id, name } = productToDelete;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        setProductToDelete(null);
        toast({
          variant: "success",
          title: "Produto removido",
          description: `${name} foi removido do catálogo.`,
        });
      },
      onError: notifyError,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
            Catálogo operacional
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Produtos</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Cadastre e mantenha os produtos do catálogo da organização. O controle de estoque é
            feito em uma tela própria.
          </p>
        </div>
        <Can module="PRODUCTS" action="CREATE">
          <Button type="button" onClick={openCreate}>
            <Icon name="plus" size={18} />
            Novo produto
          </Button>
        </Can>
      </section>

      <ProductsTable
        products={products}
        isLoading={query.isLoading}
        error={query.error instanceof Error ? query.error : null}
        pendingStatusId={pendingStatusId}
        onEdit={openEdit}
        onToggleStatus={toggleStatus}
        onDelete={requestDelete}
        onRetry={() => void query.refetch()}
      />

      <ProductFormDialog
        open={formState !== null}
        mode={formState?.mode ?? "create"}
        initialValues={formInitialValues}
        pending={isSavingForm}
        onSubmit={submitForm}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={productToDelete !== null}
        title="Remover produto"
        description={
          productToDelete ? (
            <>
              Tem certeza que deseja remover <strong>{productToDelete.name}</strong> do catálogo? O
              produto ficará inativo e poderá ser reativado depois.
            </>
          ) : null
        }
        confirmLabel="Remover"
        confirmVariant="danger"
        pending={deleteMutation.isPending}
        pendingLabel="Removendo..."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
