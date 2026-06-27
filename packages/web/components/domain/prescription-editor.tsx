"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  prescriptionFormSchema,
  type PrescriptionFormValues,
} from "@/app/organization/operacional/prescriptions/schemas/prescription-schema";
import type {
  Prescription,
  PrescriptionWriteBody,
} from "@/app/organization/operacional/prescriptions/types";

export type ProductOption = { id: string; name: string; unitLabel: string };
export type CategoryOption = { value: string; label: string };

const PRESCRIPTION_VALIDITY_MONTHS = 6;

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-base shadow-xs focus:border-[var(--border-focus)]";
const labelClassName = "text-sm font-bold text-[var(--text-primary)]";

const EMPTY_VALUES: PrescriptionFormValues = { issuedAt: "", observations: "", items: [] };

const EMPTY_ITEM = {
  scope: "PRODUCT" as const,
  productId: "",
  category: "",
  allowedQuantity: "",
  period: "MONTHLY" as const,
  notes: "",
};

/**
 * Adds whole months to a "YYYY-MM-DD" date in UTC, clamping the day to the end
 * of the target month. Mirrors the backend rule so the validity preview matches.
 */
function addMonthsUtc(dateInput: string, months: number): Date | null {
  if (!dateInput) return null;
  const base = new Date(`${dateInput}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) return null;

  const target = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(base.getUTCDate(), lastDay));
  return target;
}

function formatDateUtc(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Builds the editor's initial form values from an existing prescription. */
export function prescriptionToFormValues(prescription: Prescription): PrescriptionFormValues {
  return {
    issuedAt: prescription.issuedAt.slice(0, 10),
    observations: prescription.observations ?? "",
    items: prescription.items.map((item) => ({
      scope: item.scope,
      productId: item.productId ?? "",
      category: item.category ?? "",
      allowedQuantity: String(item.allowedQuantity),
      period: item.period,
      notes: item.notes ?? "",
    })),
  };
}

/** Maps the editor form values to the API write body. */
export function formValuesToWriteBody(values: PrescriptionFormValues): PrescriptionWriteBody {
  const observations = values.observations.trim();
  return {
    issuedAt: values.issuedAt,
    observations: observations.length > 0 ? observations : null,
    items: values.items.map((item) => {
      const notes = item.notes.trim();
      const isProduct = item.scope === "PRODUCT";
      return {
        scope: item.scope,
        productId: isProduct ? item.productId : null,
        category: isProduct ? null : item.category,
        allowedQuantity: Number(item.allowedQuantity),
        period: item.period,
        notes: notes.length > 0 ? notes : null,
      };
    }),
  };
}

type PrescriptionEditorProps = {
  products: ProductOption[];
  categories: CategoryOption[];
  productsLoading?: boolean;
  defaultValues?: PrescriptionFormValues;
  pending: boolean;
  submitLabel?: string;
  onSubmit: (body: PrescriptionWriteBody) => void;
  onCancel?: () => void;
};

/**
 * Form to transcribe a patient's receita: emission date (validity is derived as
 * +6 months) plus the posology — one purchase allowance per catalog product or
 * per whole product category. Presentational/controlled: the parent supplies
 * products/categories and handles the mutation + toasts.
 */
export function PrescriptionEditor({
  products,
  categories,
  productsLoading,
  defaultValues,
  pending,
  submitLabel = "Salvar receita",
  onSubmit,
  onCancel,
}: PrescriptionEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const issuedAt = watch("issuedAt");
  const watchedItems = watch("items");
  const validUntil = addMonthsUtc(issuedAt, PRESCRIPTION_VALIDITY_MONTHS);

  return (
    <form className="space-y-5" onSubmit={handleSubmit((values) => onSubmit(formValuesToWriteBody(values)))} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClassName} htmlFor="prescription-issued-at">
            Data de emissão
          </label>
          <Input id="prescription-issued-at" type="date" {...register("issuedAt")} />
          {errors.issuedAt ? (
            <p className="text-sm text-error">{errors.issuedAt.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <span className={labelClassName}>Válida até</span>
          <div className="flex h-11 items-center rounded-md border border-dashed border-border bg-muted px-3 text-sm">
            {validUntil ? (
              <span className="font-bold text-[var(--text-primary)]">{formatDateUtc(validUntil)}</span>
            ) : (
              <span className="text-[var(--text-tertiary)]">Emissão + 6 meses</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClassName} htmlFor="prescription-observations">
          Observações <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
        </label>
        <Textarea
          id="prescription-observations"
          placeholder="Médico responsável, origem da receita, CRM..."
          {...register("observations")}
        />
        {errors.observations ? (
          <p className="text-sm text-error">{errors.observations.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-[var(--text-primary)]">Posologia</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Limite de compra por produto ou por categoria, no período.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={productsLoading || (products.length === 0 && categories.length === 0)}
            onClick={() => append({ ...EMPTY_ITEM })}
          >
            <Icon name="plus" size={16} />
            Adicionar item
          </Button>
        </div>

        {products.length === 0 && !productsLoading ? (
          <p className="rounded-md bg-warning-subtle p-3 text-sm text-[var(--warning-600)]">
            Cadastre produtos no catálogo antes de definir a posologia.
          </p>
        ) : null}

        {fields.length === 0 ? (
          <p className="rounded-md bg-muted p-3 text-sm text-[var(--text-secondary)]">
            Nenhum item na posologia. Adicione ao menos um para liberar a aprovação.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const scope = watchedItems?.[index]?.scope ?? "PRODUCT";
              const itemErrors = errors.items?.[index];

              return (
                <div key={field.id} className="space-y-3 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-md border border-border p-0.5">
                      <ScopeToggle
                        active={scope === "PRODUCT"}
                        onClick={() => setValue(`items.${index}.scope`, "PRODUCT")}
                      >
                        Produto
                      </ScopeToggle>
                      <ScopeToggle
                        active={scope === "CATEGORY"}
                        onClick={() => setValue(`items.${index}.scope`, "CATEGORY")}
                      >
                        Categoria
                      </ScopeToggle>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Remover item"
                      onClick={() => remove(index)}
                    >
                      <Icon name="trash-2" size={18} />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    {scope === "PRODUCT" ? (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[var(--text-tertiary)]">Produto</span>
                        <select className={selectClassName} {...register(`items.${index}.productId`)}>
                          <option value="">Selecione…</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {itemErrors?.productId ? (
                          <p className="text-xs text-error">{itemErrors.productId.message}</p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[var(--text-tertiary)]">Categoria</span>
                        <select className={selectClassName} {...register(`items.${index}.category`)}>
                          <option value="">Selecione…</option>
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {itemErrors?.category ? (
                          <p className="text-xs text-error">{itemErrors.category.message}</p>
                        ) : null}
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[var(--text-tertiary)]">Quantidade</span>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="0"
                        {...register(`items.${index}.allowedQuantity`)}
                      />
                      {itemErrors?.allowedQuantity ? (
                        <p className="text-xs text-error">{itemErrors.allowedQuantity.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[var(--text-tertiary)]">Período</span>
                      <select className={selectClassName} {...register(`items.${index}.period`)}>
                        <option value="MONTHLY">Mensal</option>
                        <option value="ANNUAL">Anual</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[var(--text-tertiary)]">
                      Posologia <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
                    </span>
                    <Input
                      placeholder="Ex.: Vaporizar 0,2 a 0,3 g de 1 a 3x ao dia"
                      {...register(`items.${index}.notes`)}
                    />
                    {itemErrors?.notes ? (
                      <p className="text-xs text-error">{itemErrors.notes.message}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-1">
        {onCancel ? (
          <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function ScopeToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-3 py-1 text-sm font-bold transition-colors",
        active
          ? "bg-primary text-[var(--on-primary,white)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      )}
    >
      {children}
    </button>
  );
}
