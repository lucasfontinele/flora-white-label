import { z } from "zod";

export const prescriptionFormSchema = z.object({
  validUntil: z.string().trim().min(1, "Informe a data limite da receita."),
  // Optional free-text note; an empty value is normalized to null before it
  // reaches the API.
  observations: z.string().trim().max(500, "Máximo de 500 caracteres."),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
