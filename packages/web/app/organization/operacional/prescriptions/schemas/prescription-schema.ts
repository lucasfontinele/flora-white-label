import { z } from "zod";

export const prescriptionItemFormSchema = z.object({
  productId: z.string().trim().min(1, "Selecione um produto."),
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
});

export const prescriptionFormSchema = z.object({
  issuedAt: z.string().trim().min(1, "Informe a data de emissão da receita."),
  observations: z.string().trim().max(500, "Máximo de 500 caracteres."),
  items: z.array(prescriptionItemFormSchema),
});

export type PrescriptionItemFormValues = z.infer<typeof prescriptionItemFormSchema>;
export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
