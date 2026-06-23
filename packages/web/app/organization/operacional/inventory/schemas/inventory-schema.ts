import { z } from "zod";
import { STOCK_OPERATIONS } from "../types";

// Non-negative integer captured as text (number inputs leave "" when cleared),
// e.g. initial available/minimum quantities at position creation.
const nonNegativeIntegerField = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), {
    message: "Informe um número inteiro maior ou igual a zero.",
  });

export const createInventoryFormSchema = z.object({
  productId: z.string().min(1, "Selecione um produto."),
  availableQuantity: nonNegativeIntegerField,
  minimumQuantity: nonNegativeIntegerField,
  reason: z.string().trim().max(280, "Máximo de 280 caracteres."),
});

export type CreateInventoryFormValues = z.infer<typeof createInventoryFormSchema>;

export const stockMovementFormSchema = z
  .object({
    operation: z.enum(STOCK_OPERATIONS, { message: "Selecione a operação." }),
    quantity: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value), { message: "Informe uma quantidade válida." }),
    reason: z.string().trim().max(280, "Máximo de 280 caracteres."),
  })
  // Every operation except the absolute adjustment requires a positive amount.
  .refine((values) => values.operation === "adjust" || Number(values.quantity) > 0, {
    path: ["quantity"],
    message: "A quantidade deve ser maior que zero.",
  });

export type StockMovementFormValues = z.infer<typeof stockMovementFormSchema>;
