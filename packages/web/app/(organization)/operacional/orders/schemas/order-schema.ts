import { z } from "zod";
import { orderStages } from "@/lib/data";

export const operatorOrderSchema = z.object({
  id: z.string(),
  number: z.string(),
  patient: z.string(),
  responsible: z.string(),
  status: z.enum(orderStages),
  createdAt: z.string(),
  items: z.number(),
  deliveryType: z.enum(["Retirada", "Correio"]),
  documentStatus: z.enum(["OK", "Pendente"]),
});
