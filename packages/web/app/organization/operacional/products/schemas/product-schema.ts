import { z } from "zod";
import { parseCurrencyToCents } from "@/lib/money";
import {
  COVER_IMAGE_ACCEPTED_TYPES,
  COVER_IMAGE_MAX_SIZE_BYTES,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  PRODUCT_UNITS,
  STRAIN_TYPES,
} from "../types";

// Optional percentage field: empty is allowed (normalized to null at submit),
// otherwise it must be a non-negative number.
const optionalPercentage = z
  .string()
  .trim()
  .refine((value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
    message: "Informe um percentual válido (≥ 0).",
  });

// Optional cover image. SSR-safe (`File` is guarded) and validated against the
// same formats/size the API enforces. `null` means "no new file selected".
const optionalCoverImage = z
  .custom<File | null>(
    (value) => value === null || (typeof File !== "undefined" && value instanceof File),
    { message: "Arquivo inválido." },
  )
  .superRefine((file, ctx) => {
    if (!file) return;
    if (!COVER_IMAGE_ACCEPTED_TYPES.includes(file.type)) {
      ctx.addIssue({ code: "custom", message: "Use uma imagem JPG, PNG ou WebP." });
    }
    if (file.size > COVER_IMAGE_MAX_SIZE_BYTES) {
      ctx.addIssue({ code: "custom", message: "A imagem deve ter no máximo 5 MB." });
    }
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
  // Newly selected cover image, if any (uploaded separately after the product
  // is saved). Optional — the image is never required.
  coverImage: optionalCoverImage,
  // Edit-only flag: the operator cleared the previously stored cover image.
  removeCoverImage: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
