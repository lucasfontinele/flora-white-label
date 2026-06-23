"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "../../products/types";
import {
  stockMovementFormSchema,
  type StockMovementFormValues,
} from "../schemas/inventory-schema";
import {
  STOCK_OPERATION_HINTS,
  STOCK_OPERATION_LABELS,
  STOCK_OPERATIONS,
  type InventoryItem,
} from "../types";

type StockMovementDialogProps = {
  open: boolean;
  product: Product | null;
  inventory: InventoryItem | null;
  pending: boolean;
  onSubmit: (values: StockMovementFormValues) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: StockMovementFormValues = {
  operation: "add-stock",
  quantity: "",
  reason: "",
};

const labelClassName = "text-sm font-bold text-[var(--text-primary)]";
const optionalHint = <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>;

export function StockMovementDialog({
  open,
  product,
  inventory,
  pending,
  onSubmit,
  onCancel,
}: StockMovementDialogProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const operation = watch("operation");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) reset(EMPTY_VALUES);
  }, [open, reset]);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending, onCancel]);

  if (!mounted || !open) return null;

  const quantityLabel = operation === "adjust" ? "Novo disponível" : "Quantidade";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id={titleId} className="font-heading text-lg text-[var(--text-primary)]">
          Movimentar estoque
        </h2>
        {product ? (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{product.name}</p>
        ) : null}
        {inventory ? (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Disponível <strong className="text-[var(--text-primary)]">{inventory.availableQuantity}</strong>{" "}
            · Reservado{" "}
            <strong className="text-[var(--text-primary)]">{inventory.reservedQuantity}</strong>
          </p>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor="movement-operation">
              Operação
            </label>
            <Controller
              control={control}
              name="operation"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="movement-operation" aria-label="Operação">
                    <SelectValue placeholder="Selecione a operação" />
                  </SelectTrigger>
                  <SelectContent>
                    {STOCK_OPERATIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {STOCK_OPERATION_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-sm text-[var(--text-secondary)]">{STOCK_OPERATION_HINTS[operation]}</p>
            {errors.operation ? (
              <p className="text-sm text-error">{errors.operation.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor="movement-quantity">
              {quantityLabel}
            </label>
            <Input
              id="movement-quantity"
              autoFocus
              inputMode="numeric"
              placeholder="0"
              {...register("quantity")}
            />
            {errors.quantity ? (
              <p className="text-sm text-error">{errors.quantity.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor="movement-reason">
              Motivo {optionalHint}
            </label>
            <Textarea
              id="movement-reason"
              placeholder="Ex.: Compra de reposição."
              {...register("reason")}
            />
            {errors.reason ? <p className="text-sm text-error">{errors.reason.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
