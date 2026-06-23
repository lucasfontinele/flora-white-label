import { z } from "zod";
import { parseCurrencyToCents } from "@/lib/money";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES, PRODUCT_UNITS, STRAIN_TYPES } from "../types";

// Optional percentage field: empty is allowed (normalized to null at submit),
// otherwise it must be a non-negative number.
const optionalPercentage = z
  .string()
  .trim()
  .refine((value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
    message: "Informe um percentual válido (≥ 0).",
  });

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do produto.")
    .max(120, "Máximo de 120 caracteres."),
  // Optional free text; empty is normalized to null before reaching the API.
  description: z.string().trim().max(500, "Máximo de 500 caracteres."),
  category: z.enum(PRODUCT_CATEGORIES, { message: "Selecione a categoria." }),
  type: z.enum(PRODUCT_TYPES, { message: "Selecione o tipo." }),
  // Optional strain; an empty value maps to null.
  strainType: z.union([z.enum(STRAIN_TYPES), z.literal("")]),
  thcPercentage: optionalPercentage,
  cbdPercentage: optionalPercentage,
  unit: z.enum(PRODUCT_UNITS, { message: "Selecione a unidade." }),
  // Currency string (e.g. "R$ 159,00"); must resolve to a positive cent amount.
  price: z
    .string()
    .refine((value) => parseCurrencyToCents(value) > 0, "Informe um preço válido."),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
