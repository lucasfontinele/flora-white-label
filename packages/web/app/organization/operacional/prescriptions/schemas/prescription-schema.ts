import { z } from "zod";

export const prescriptionItemFormSchema = z
  .object({
    scope: z.enum(["PRODUCT", "CATEGORY"]),
    productId: z.string().trim(),
    category: z.string().trim(),
    // Kept as a string for the number input; coerced/validated as a positive int.
    allowedQuantity: z
      .string()
      .trim()
      .min(1, "Informe a quantidade.")
      .refine((value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 1;
      }, "Quantidade deve ser um número inteiro ≥ 1."),
    period: z.enum(["MONTHLY", "ANNUAL"]),
    notes: z.string().trim().max(300, "Máximo de 300 caracteres."),
  })
  .refine((item) => (item.scope === "PRODUCT" ? item.productId.length > 0 : true), {
    message: "Selecione um produto.",
    path: ["productId"],
  })
  .refine((item) => (item.scope === "CATEGORY" ? item.category.length > 0 : true), {
    message: "Selecione uma categoria.",
    path: ["category"],
  });

export const prescriptionFormSchema = z.object({
  issuedAt: z.string().trim().min(1, "Informe a data de emissão da receita."),
  observations: z.string().trim().max(500, "Máximo de 500 caracteres."),
  items: z.array(prescriptionItemFormSchema),
});

export type PrescriptionItemFormValues = z.infer<typeof prescriptionItemFormSchema>;
export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
