"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCentsAsCurrency, parseCurrencyToCents } from "@/lib/money";
import { productFormSchema, type ProductFormValues } from "../schemas/product-schema";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  PRODUCT_UNIT_LABELS,
  PRODUCT_UNITS,
  STRAIN_TYPE_LABELS,
  STRAIN_TYPES,
} from "../types";

type ProductFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: ProductFormValues;
  pending: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  description: "",
  category: "FLOWER",
  type: "CBD",
  strainType: "",
  thcPercentage: "",
  cbdPercentage: "",
  unit: "UNIT",
  price: "",
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs focus:border-[var(--border-focus)]";
const labelClassName = "text-sm font-bold text-[var(--text-primary)]";
const optionalHint = <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>;

/**
 * Create/edit modal for an organization product. Renders every field exposed by
 * the API write contract: enum fields are rendered as selectable lists and the
 * price is captured as currency and converted to integer cents by the caller.
 */
export function ProductFormDialog({
  open,
  mode,
  initialValues,
  pending,
  onSubmit,
  onCancel,
}: ProductFormDialogProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) reset(initialValues ?? EMPTY_VALUES);
  }, [open, initialValues, reset]);

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

  const isEdit = mode === "edit";

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
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id={titleId} className="font-heading text-lg text-[var(--text-primary)]">
          {isEdit ? "Editar produto" : "Novo produto"}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Preencha os dados comerciais e a classificação do produto do catálogo.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor="product-name">
              Nome do produto
            </label>
            <Input id="product-name" autoFocus placeholder="Ex.: Óleo CBD 1000mg" {...register("name")} />
            {errors.name ? <p className="text-sm text-error">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor="product-description">
              Descrição {optionalHint}
            </label>
            <Textarea
              id="product-description"
              placeholder="Frasco com 30ml, indicado para..."
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-error">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-category">
                Categoria
              </label>
              <select id="product-category" className={selectClassName} {...register("category")}>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {PRODUCT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="text-sm text-error">{errors.category.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-type">
                Tipo
              </label>
              <select id="product-type" className={selectClassName} {...register("type")}>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PRODUCT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              {errors.type ? <p className="text-sm text-error">{errors.type.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-unit">
                Unidade
              </label>
              <select id="product-unit" className={selectClassName} {...register("unit")}>
                {PRODUCT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {PRODUCT_UNIT_LABELS[unit]}
                  </option>
                ))}
              </select>
              {errors.unit ? <p className="text-sm text-error">{errors.unit.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-strain">
                Linhagem {optionalHint}
              </label>
              <select id="product-strain" className={selectClassName} {...register("strainType")}>
                <option value="">Sem linhagem</option>
                {STRAIN_TYPES.map((strain) => (
                  <option key={strain} value={strain}>
                    {STRAIN_TYPE_LABELS[strain]}
                  </option>
                ))}
              </select>
              {errors.strainType ? (
                <p className="text-sm text-error">{errors.strainType.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-thc">
                THC % {optionalHint}
              </label>
              <Input
                id="product-thc"
                inputMode="decimal"
                placeholder="Ex.: 0.2"
                {...register("thcPercentage")}
              />
              {errors.thcPercentage ? (
                <p className="text-sm text-error">{errors.thcPercentage.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-cbd">
                CBD % {optionalHint}
              </label>
              <Input
                id="product-cbd"
                inputMode="decimal"
                placeholder="Ex.: 10"
                {...register("cbdPercentage")}
              />
              {errors.cbdPercentage ? (
                <p className="text-sm text-error">{errors.cbdPercentage.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName} htmlFor="product-price">
                Preço
              </label>
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <Input
                    id="product-price"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(formatCentsAsCurrency(parseCurrencyToCents(event.target.value)))
                    }
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.price ? <p className="text-sm text-error">{errors.price.message}</p> : null}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
