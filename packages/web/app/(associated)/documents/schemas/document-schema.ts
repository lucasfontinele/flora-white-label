import { z } from "zod";

export const documentSchema = z.object({
  patientId: z.string(),
  name: z.string(),
  due: z.string(),
  status: z.enum(["Aprovado", "Em análise", "Recusado"]),
});
