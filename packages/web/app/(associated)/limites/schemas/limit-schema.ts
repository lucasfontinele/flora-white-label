import { z } from "zod";

export const purchaseLimitSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  product: z.string(),
  brand: z.string(),
  form: z.enum(["Óleo", "Flor", "Goma", "Pomada", "Concentrado"]),
  unit: z.enum(["frasco", "g", "unidade", "embalagem"]),
  period: z.enum(["mensal", "anual"]),
  allowed: z.number().nonnegative(),
  used: z.number().nonnegative(),
  prescriptionDue: z.string(),
  posology: z.string(),
});

export type PurchaseLimitInput = z.infer<typeof purchaseLimitSchema>;
